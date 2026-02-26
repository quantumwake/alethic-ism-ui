import registry from '../../tools/registry.js';
import { OpenAIAdapter } from '../../tools/providers/openai.js';
import { buildSystemPrompt } from '../../tools/systemPrompt.js';
import autoLayout from '../../tools/autoLayout.js';
import idMapping from '../../tools/idMapping.js';

const adapters = {
    openai: new OpenAIAdapter(),
};

/**
 * Create a Proxy around the Zustand `get` function so that every property
 * access reads fresh state.  Without this, tools receive a snapshot that
 * goes stale after mutations (e.g. `store.workflowNodes` wouldn't include
 * a node that was just created).
 */
function createStoreProxy(get) {
    return new Proxy({}, {
        get: (_target, prop) => {
            return get()[prop];
        },
    });
}

/**
 * Chat Assistant Zustand slice.
 *
 * Manages conversation state, tool execution loop, and pending confirmations.
 */
export const useChatAssistantSlice = (set, get) => ({
    // ─── Conversation state ────────────────────────────────────────────
    chatMessages: [],           // Array of messages in OpenAI-compatible format
    chatDisplayMessages: [],    // UI-friendly messages: { role, content, toolCalls?, toolResults?, timestamp }
    isProcessing: false,
    pendingConfirmations: [],   // { callId, toolName, arguments, description }

    // ─── Configuration ─────────────────────────────────────────────────
    chatModel: 'claude-sonnet-4-6',
    chatProvider: 'openai',
    autoConfirm: false,

    // ─── UI triggers ───────────────────────────────────────────────────
    pendingUploadStateId: null,  // when set, the UI opens a file picker for this state
    setPendingUploadStateId: (stateId) => set({ pendingUploadStateId: stateId }),
    clearPendingUploadStateId: () => set({ pendingUploadStateId: null }),

    // ─── Setters ───────────────────────────────────────────────────────
    setChatModel: (model) => set({ chatModel: model }),
    setChatProvider: (provider) => set({ chatProvider: provider }),
    setAutoConfirm: (val) => set({ autoConfirm: val }),

    clearChatHistory: () => {
        idMapping.reset();
        set({
            chatMessages: [],
            chatDisplayMessages: [],
            pendingConfirmations: [],
        });
    },

    // ─── Main entry point ──────────────────────────────────────────────
    sendChatMessage: async (userMessage) => {
        if (!userMessage?.trim() || get().isProcessing) return;

        const text = userMessage.trim();
        set({ isProcessing: true });

        // Reset auto-layout for this turn
        autoLayout.reset();

        // Append user message to conversation
        const userMsg = { role: 'user', content: text };
        const displayMsg = { role: 'user', content: text, timestamp: Date.now() };

        set(s => ({
            chatMessages: [...s.chatMessages, userMsg],
            chatDisplayMessages: [...s.chatDisplayMessages, displayMsg],
        }));

        try {
            await get()._runAssistantLoop();
        } catch (err) {
            console.error('Chat assistant error:', err);
            const errDisplay = {
                role: 'assistant',
                content: `Error: ${err.message || 'Something went wrong.'}`,
                timestamp: Date.now(),
                isError: true,
            };
            set(s => ({
                chatDisplayMessages: [...s.chatDisplayMessages, errDisplay],
            }));
        } finally {
            set({ isProcessing: false });
        }
    },

    // ─── Assistant loop (call LLM → execute tools → repeat) ───────────
    _runAssistantLoop: async () => {
        const MAX_ITERATIONS = 10;

        for (let i = 0; i < MAX_ITERATIONS; i++) {
            // Pre-fetch data for any nodes missing labels so the system prompt has proper context
            const nodes = get().workflowNodes || [];
            for (const n of nodes) {
                const hasLabel = n.data?.config?.name || n.data?.name || n.data?.label;
                if (!hasLabel) {
                    try {
                        if (n.type === 'state') {
                            await get().fetchState(n.id);
                        } else if (n.type?.startsWith('processor') || n.type?.startsWith('function')) {
                            await get().fetchProcessor(n.id);
                        }
                    } catch (_) { /* best-effort */ }
                }
            }

            // Seed ID mapping from current context (on every iteration so new nodes are included)
            idMapping.seedFromContext({
                nodes: get().workflowNodes || [],
                templates: get().templates || [],
                edges: get().workflowEdges || [],
            });

            // Build request
            const adapter = adapters[get().chatProvider] || adapters.openai;
            const schemas = registry.getSchemas();
            const tools = schemas.length > 0 ? adapter.formatTools(schemas) : undefined;

            const systemPrompt = buildSystemPrompt({
                nodes: get().workflowNodes || [],
                edges: get().workflowEdges || [],
                templates: get().templates || [],
                providers: get().providers || [],
                projectId: get().selectedProjectId,
                selectedNodeId: get().selectedNodeId,
                projects: get().projects || [],
            });

            const messages = [
                { role: 'system', content: systemPrompt },
                ...get().chatMessages,
            ];

            const requestBody = {
                messages,
                model: get().chatModel,
                temperature: 0.3,
                max_tokens: 4096,
            };
            if (tools && tools.length > 0) {
                requestBody.tools = tools;
            }

            // Call backend
            const response = await get().authPost('/assistant/chat', requestBody);
            if (!response.ok) {
                throw new Error(`Assistant API returned ${response.status}`);
            }
            const data = await response.json();

            // Parse response
            const { content, toolCalls } = adapter.parseResponse(data);

            // No tool calls — final text response
            if (!toolCalls || toolCalls.length === 0) {
                const assistantMsg = { role: 'assistant', content: content || '' };
                const assistantDisplay = {
                    role: 'assistant',
                    content: content || '',
                    timestamp: Date.now(),
                };
                set(s => ({
                    chatMessages: [...s.chatMessages, assistantMsg],
                    chatDisplayMessages: [...s.chatDisplayMessages, assistantDisplay],
                }));
                return; // done
            }

            // Has tool calls — execute them
            // First, add the assistant message with tool calls to history
            const assistantToolMsg = adapter.formatAssistantToolCallMessage(content, toolCalls);
            set(s => ({
                chatMessages: [...s.chatMessages, assistantToolMsg],
            }));

            // Show tool calls in display
            if (content) {
                set(s => ({
                    chatDisplayMessages: [...s.chatDisplayMessages, {
                        role: 'assistant',
                        content,
                        timestamp: Date.now(),
                    }],
                }));
            }

            // Execute each tool call
            const toolResults = [];
            for (const tc of toolCalls) {
                const needsConfirm = registry.requiresConfirmation(tc.name);

                if (needsConfirm && !get().autoConfirm) {
                    // Queue for confirmation and wait
                    const result = await get()._waitForConfirmation(tc);
                    toolResults.push({ id: tc.id, name: tc.name, result });
                } else {
                    // Execute immediately
                    const toolDisplay = {
                        role: 'tool_call',
                        toolName: tc.name,
                        arguments: tc.arguments,
                        timestamp: Date.now(),
                        status: 'running',
                    };
                    set(s => ({
                        chatDisplayMessages: [...s.chatDisplayMessages, toolDisplay],
                    }));

                    const result = await registry.execute(tc.name, tc.arguments, createStoreProxy(get));

                    // Update display with result
                    set(s => ({
                        chatDisplayMessages: s.chatDisplayMessages.map(m =>
                            m === toolDisplay
                                ? { ...m, result, status: result?.success !== false ? 'success' : 'error' }
                                : m
                        ),
                    }));

                    toolResults.push({ id: tc.id, name: tc.name, result });
                }
            }

            // Add tool results to conversation history
            const resultMessages = adapter.formatToolResults(toolResults);
            set(s => ({
                chatMessages: [...s.chatMessages, ...resultMessages],
            }));

            // Loop: send results back to LLM for follow-up
        }

        // If we hit max iterations, add a warning
        set(s => ({
            chatDisplayMessages: [...s.chatDisplayMessages, {
                role: 'assistant',
                content: 'Reached maximum tool call iterations. Some actions may be incomplete.',
                timestamp: Date.now(),
                isWarning: true,
            }],
        }));
    },

    // ─── Confirmation handling ─────────────────────────────────────────
    _waitForConfirmation: (toolCall) => {
        return new Promise((resolve) => {
            const confirmation = {
                callId: toolCall.id,
                toolName: toolCall.name,
                arguments: toolCall.arguments,
                description: _describeToolCall(toolCall),
                resolve, // will be called by confirm/reject
            };

            set(s => ({
                pendingConfirmations: [...s.pendingConfirmations, confirmation],
                chatDisplayMessages: [...s.chatDisplayMessages, {
                    role: 'confirmation',
                    toolName: toolCall.name,
                    arguments: toolCall.arguments,
                    callId: toolCall.id,
                    timestamp: Date.now(),
                }],
            }));
        });
    },

    confirmToolCall: async (callId) => {
        const pending = get().pendingConfirmations.find(p => p.callId === callId);
        if (!pending) return;

        // Execute the tool
        const result = await registry.execute(pending.toolName, pending.arguments, get());

        // Update display
        set(s => ({
            pendingConfirmations: s.pendingConfirmations.filter(p => p.callId !== callId),
            chatDisplayMessages: s.chatDisplayMessages.map(m =>
                m.callId === callId
                    ? { ...m, role: 'tool_call', result, status: result?.success !== false ? 'success' : 'error' }
                    : m
            ),
        }));

        // Resolve the promise
        pending.resolve(result);
    },

    rejectToolCall: (callId) => {
        const pending = get().pendingConfirmations.find(p => p.callId === callId);
        if (!pending) return;

        const result = { success: false, error: 'User rejected this action.' };

        set(s => ({
            pendingConfirmations: s.pendingConfirmations.filter(p => p.callId !== callId),
            chatDisplayMessages: s.chatDisplayMessages.map(m =>
                m.callId === callId
                    ? { ...m, role: 'tool_call', result, status: 'rejected' }
                    : m
            ),
        }));

        pending.resolve(result);
    },
});

/**
 * Generate a human-readable description of a tool call for confirmation UI.
 */
function _describeToolCall(tc) {
    const tool = registry.getTool(tc.name);
    const desc = tool?.description || tc.name;
    const argsStr = Object.entries(tc.arguments || {})
        .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
        .join(', ');
    return `${desc}${argsStr ? ` (${argsStr})` : ''}`;
}

export default useChatAssistantSlice;
