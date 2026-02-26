import { BaseProviderAdapter } from './base.js';

/**
 * OpenAI function-calling adapter.
 *
 * Converts neutral tool schemas to the OpenAI `tools[]` format and parses
 * `tool_calls[]` from assistant messages.
 */
export class OpenAIAdapter extends BaseProviderAdapter {
    /**
     * Convert neutral schemas → OpenAI tools format.
     *
     * OpenAI expects:
     *   { type: "function", function: { name, description, parameters } }
     */
    formatTools(schemas) {
        return schemas.map(s => ({
            type: 'function',
            function: {
                name: s.name,
                description: s.description,
                parameters: s.parameters,
            },
        }));
    }

    /**
     * Parse an OpenAI chat completion response.
     *
     * The response shape (after .model_dump() on the Python side or raw JSON):
     *   { choices: [{ message: { role, content, tool_calls } }] }
     *
     * Each tool_call:
     *   { id, type: "function", function: { name, arguments } }
     *   where `arguments` is a JSON string.
     */
    parseResponse(response) {
        const message = response?.choices?.[0]?.message;
        if (!message) {
            return { content: null, toolCalls: [] };
        }

        const content = message.content || null;
        const toolCalls = (message.tool_calls || []).map(tc => ({
            id: tc.id,
            name: tc.function.name,
            arguments: this._parseArguments(tc.function.arguments),
        }));

        return { content, toolCalls };
    }

    /**
     * Format tool execution results as messages to send back to the LLM.
     *
     * OpenAI expects one message per tool result:
     *   { role: "tool", tool_call_id, content }
     */
    formatToolResults(toolResults) {
        return toolResults.map(tr => ({
            role: 'tool',
            tool_call_id: tr.id,
            content: typeof tr.result === 'string' ? tr.result : JSON.stringify(tr.result),
        }));
    }

    /**
     * Build the assistant message entry that contains tool calls.
     *
     * This is needed so the conversation history includes the assistant's
     * tool_calls, which OpenAI requires before the tool result messages.
     */
    formatAssistantToolCallMessage(content, toolCalls) {
        return {
            role: 'assistant',
            content: content || null,
            tool_calls: toolCalls.map(tc => ({
                id: tc.id,
                type: 'function',
                function: {
                    name: tc.name,
                    arguments: typeof tc.arguments === 'string'
                        ? tc.arguments
                        : JSON.stringify(tc.arguments),
                },
            })),
        };
    }

    /** Safely parse JSON arguments string. */
    _parseArguments(argsStr) {
        if (!argsStr) return {};
        if (typeof argsStr === 'object') return argsStr;
        try {
            return JSON.parse(argsStr);
        } catch {
            console.warn('Failed to parse tool arguments:', argsStr);
            return {};
        }
    }
}

export default OpenAIAdapter;
