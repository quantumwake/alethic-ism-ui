import React, { useEffect, useRef, useState } from 'react';
import {
    SparklesIcon, SendIcon, Trash2Icon, RefreshCwIcon,
    CheckIcon, XIcon, WrenchIcon, AlertTriangleIcon,
    ChevronDownIcon, ChevronRightIcon, BotIcon, UserIcon,
    CopyIcon, SettingsIcon,
} from 'lucide-react';
import { useStore } from '../store';
import { TerminalToggle } from '../components/common';

// Initialize all tools on first import
import '../tools/index.js';

const AIAssistantTab = () => {
    const theme = useStore(state => state.getCurrentTheme());
    const {
        // Chat assistant state
        chatDisplayMessages,
        isProcessing,
        pendingConfirmations,
        chatModel,
        chatProvider,
        autoConfirm,

        // Chat assistant actions
        sendChatMessage,
        confirmToolCall,
        rejectToolCall,
        clearChatHistory,
        setChatModel,
        setAutoConfirm,

        // Context
        selectedProjectId,
        selectedNodeId,
        workflowNodes,
        workflowEdges,
        authGet,
    } = useStore();

    const [message, setMessage] = useState('');
    const [models, setModels] = useState([]);
    const [showSettings, setShowSettings] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        authGet('/assistant/models')
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data && Array.isArray(data)) {
                    setModels(data);
                    // If current model isn't in the list, select the first available
                    if (data.length > 0 && !data.find(m => m.id === chatModel)) {
                        setChatModel(data[0].id);
                    }
                }
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatDisplayMessages]);

    const handleSubmit = () => {
        if (!message.trim() || isProcessing) return;
        sendChatMessage(message);
        setMessage('');
    };

    const nodeCount = workflowNodes?.length || 0;
    const edgeCount = workflowEdges?.length || 0;

    return (
        <div className={`flex flex-col h-full ${theme.bg}`}>

            {/* Header */}
            <div className={`flex items-center justify-between p-2 border-b ${theme.border}`}>
                <div className="flex items-center gap-2">
                    <SparklesIcon className={`w-4 h-4 ${theme.textAccent}`} />
                    <span className={`${theme.text} font-medium text-sm`}>Workflow Assistant</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`${theme.hover} ${theme.text} p-1 rounded`}
                        title="Settings"
                    >
                        <SettingsIcon className="w-3.5 h-3.5" />
                    </button>
                    {chatDisplayMessages.length > 0 && (
                        <button
                            onClick={clearChatHistory}
                            className={`${theme.hover} ${theme.text} p-1 rounded`}
                            title="Clear history"
                        >
                            <Trash2Icon className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Settings panel (collapsible) */}
            {showSettings && (
                <div className={`p-2 border-b ${theme.border} space-y-2`}>
                    <select
                        value={chatModel}
                        onChange={(e) => setChatModel(e.target.value)}
                        className={`w-full ${theme.bg} ${theme.text} border ${theme.border} px-2 py-1 text-xs rounded`}
                    >
                        {models.map(m => (
                            <option key={m.id || m} value={m.id || m}>
                                {m.name || m.id || m} {m.provider ? `(${m.provider})` : ''}
                            </option>
                        ))}
                    </select>
                    <TerminalToggle
                        checked={autoConfirm}
                        onChange={setAutoConfirm}
                        label="Auto-confirm destructive actions"
                        size="small"
                    />
                </div>
            )}

            {/* Context indicator */}
            <div className={`px-2 py-1 border-b ${theme.border} flex items-center gap-2 text-[10px] ${theme.textMuted}`}>
                <span>{selectedProjectId ? `Project: ${selectedProjectId.slice(0, 8)}...` : 'No project'}</span>
                <span>|</span>
                <span>{nodeCount} nodes, {edgeCount} edges</span>
                {selectedNodeId && (
                    <>
                        <span>|</span>
                        <span className={theme.textAccent}>Selected: {selectedNodeId.slice(0, 8)}...</span>
                    </>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-2 space-y-2">
                {chatDisplayMessages.length === 0 && !isProcessing && (
                    <WelcomeMessage theme={theme} />
                )}

                {chatDisplayMessages.map((msg, i) => (
                    <MessageBubble key={i} msg={msg} theme={theme} onConfirm={confirmToolCall} onReject={rejectToolCall} />
                ))}

                {isProcessing && (
                    <div className="flex items-center gap-2 py-1">
                        <RefreshCwIcon className={`w-3.5 h-3.5 animate-spin ${theme.textAccent}`} />
                        <span className={`text-xs ${theme.textMuted}`}>Thinking...</span>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className={`p-2 border-t ${theme.border}`}>
                <div className="flex gap-2">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                        placeholder={selectedProjectId ? "Ask the assistant to build your workflow..." : "Ask me to create or open a project..."}
                        className={`flex-1 ${theme.bg} ${theme.text} border ${theme.border} px-2 py-1.5 text-xs resize-none rounded`}
                        rows={2}
                        disabled={isProcessing}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={isProcessing || !message.trim()}
                        className={`${theme.hover} border ${theme.border} disabled:opacity-50 ${theme.text} px-3 rounded`}
                    >
                        <SendIcon className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Welcome Message ───────────────────────────────────────────────────
const WelcomeMessage = ({ theme }) => (
    <div className={`${theme.textMuted} text-xs space-y-2 p-2`}>
        <p className="font-medium">Workflow Assistant</p>
        <p>I can help you build ISM workflows. Try:</p>
        <ul className="space-y-1 ml-2">
            <li className={theme.textAccent}>"Create an OpenAI processor with input and output states"</li>
            <li className={theme.textAccent}>"Connect state X to processor Y"</li>
            <li className={theme.textAccent}>"Create a user prompt template for summarization"</li>
            <li className={theme.textAccent}>"What nodes are in this project?"</li>
            <li className={theme.textAccent}>"Start the processor"</li>
        </ul>
    </div>
);

// ─── Message Bubble ────────────────────────────────────────────────────
const MessageBubble = ({ msg, theme, onConfirm, onReject }) => {
    const [copied, setCopied] = useState(false);

    const copyContent = (content) => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // User message
    if (msg.role === 'user') {
        return (
            <div className="flex gap-2">
                <UserIcon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${theme.textMuted}`} />
                <div className={`text-xs ${theme.text}`}>
                    <pre className="whitespace-pre-wrap">{msg.content}</pre>
                </div>
            </div>
        );
    }

    // Assistant text message
    if (msg.role === 'assistant') {
        return (
            <div className="flex gap-2">
                <BotIcon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${theme.textAccent}`} />
                <div className="flex-1 min-w-0">
                    <div className={`text-xs ${msg.isError ? 'text-red-400' : msg.isWarning ? 'text-yellow-400' : theme.text}`}>
                        <pre className="whitespace-pre-wrap break-words">{msg.content}</pre>
                    </div>
                    {msg.content && (
                        <button
                            onClick={() => copyContent(msg.content)}
                            className={`mt-1 ${theme.hover} ${theme.textMuted} p-0.5 rounded`}
                            title="Copy"
                        >
                            {copied ? <CheckIcon className="w-3 h-3" /> : <CopyIcon className="w-3 h-3" />}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Tool call (executed or running)
    if (msg.role === 'tool_call') {
        return <ToolCallCard msg={msg} theme={theme} />;
    }

    // Confirmation prompt
    if (msg.role === 'confirmation') {
        return <ConfirmationCard msg={msg} theme={theme} onConfirm={onConfirm} onReject={onReject} />;
    }

    return null;
};

// ─── Tool Call Card ────────────────────────────────────────────────────
const ToolCallCard = ({ msg, theme }) => {
    const [expanded, setExpanded] = useState(false);

    const statusColors = {
        running: theme.textAccent,
        success: 'text-green-400',
        error: 'text-red-400',
        rejected: 'text-yellow-400',
    };

    const statusIcons = {
        running: <RefreshCwIcon className="w-3 h-3 animate-spin" />,
        success: <CheckIcon className="w-3 h-3" />,
        error: <XIcon className="w-3 h-3" />,
        rejected: <AlertTriangleIcon className="w-3 h-3" />,
    };

    const toolLabel = msg.toolName?.replace(/_/g, ' ') || 'tool';

    return (
        <div className={`border ${theme.border} rounded text-xs ml-5`}>
            <button
                onClick={() => setExpanded(!expanded)}
                className={`w-full flex items-center gap-2 px-2 py-1 ${theme.hover} rounded`}
            >
                <WrenchIcon className={`w-3 h-3 ${theme.textMuted}`} />
                <span className={`${statusColors[msg.status] || theme.textMuted} flex items-center gap-1`}>
                    {statusIcons[msg.status]}
                    {toolLabel}
                </span>
                <span className="flex-1" />
                {expanded
                    ? <ChevronDownIcon className={`w-3 h-3 ${theme.textMuted}`} />
                    : <ChevronRightIcon className={`w-3 h-3 ${theme.textMuted}`} />
                }
            </button>
            {expanded && (
                <div className={`px-2 py-1 border-t ${theme.border} space-y-1`}>
                    {msg.arguments && (
                        <div>
                            <span className={theme.textMuted}>Args: </span>
                            <pre className={`${theme.text} whitespace-pre-wrap break-all`}>
                                {JSON.stringify(msg.arguments, null, 2)}
                            </pre>
                        </div>
                    )}
                    {msg.result && (
                        <div>
                            <span className={theme.textMuted}>Result: </span>
                            <pre className={`${msg.result?.success === false ? 'text-red-400' : 'text-green-400'} whitespace-pre-wrap break-all`}>
                                {JSON.stringify(msg.result, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Confirmation Card ─────────────────────────────────────────────────
const ConfirmationCard = ({ msg, theme, onConfirm, onReject }) => {
    const toolLabel = msg.toolName?.replace(/_/g, ' ') || 'action';
    const argsStr = msg.arguments
        ? Object.entries(msg.arguments).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(', ')
        : '';

    return (
        <div className={`border border-yellow-600/50 rounded text-xs ml-5 bg-yellow-900/10`}>
            <div className="px-2 py-1.5 flex items-start gap-2">
                <AlertTriangleIcon className="w-3.5 h-3.5 text-yellow-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="text-yellow-400 font-medium mb-1">Confirm: {toolLabel}</div>
                    {argsStr && (
                        <div className={`${theme.textMuted} mb-2 break-all`}>{argsStr}</div>
                    )}
                    <div className="flex gap-2">
                        <button
                            onClick={() => onConfirm(msg.callId)}
                            className="flex items-center gap-1 px-2 py-0.5 bg-green-800/50 hover:bg-green-700/50 text-green-400 rounded border border-green-600/50"
                        >
                            <CheckIcon className="w-3 h-3" /> Approve
                        </button>
                        <button
                            onClick={() => onReject(msg.callId)}
                            className="flex items-center gap-1 px-2 py-0.5 bg-red-800/50 hover:bg-red-700/50 text-red-400 rounded border border-red-600/50"
                        >
                            <XIcon className="w-3 h-3" /> Reject
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAssistantTab;
