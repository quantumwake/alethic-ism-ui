import React, {useEffect, useState, useRef} from 'react';
import {SparklesIcon, SendIcon, CopyIcon, CheckIcon, Trash2Icon, RefreshCwIcon} from 'lucide-react';
import {useStore} from '../store';
import {TerminalToggle} from '../components/common';

const AIAssistantTab = () => {
    const theme = useStore(state => state.getCurrentTheme());
    const {
        selectedFile,
        setSelectedFileContent,
        chatCompletion,
        fetchAvailableModels,
        fetchStateSamples,
        selectedProjectId
    } = useStore();

    const [message, setMessage] = useState('');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [model, setModel] = useState('gpt-4o-mini');
    const [models, setModels] = useState(['gpt-4o-mini', 'gpt-4o']);
    const [copied, setCopied] = useState(null);
    const [includeContext, setIncludeContext] = useState(true);
    const chatEndRef = useRef(null);

    useEffect(() => {
        fetchAvailableModels().then(m => m && setModels(m));
    }, [fetchAvailableModels]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const extractCode = (content) => {
        if (!content) return null;

        // Find first ``` and track depth to find matching closing ```
        const lines = content.split('\n');
        let depth = 0, codeLines = [], started = false;

        for (const line of lines) {
            const isFence = line.trim().match(/^```\w*$/);

            if (isFence && !started) {
                started = true;
                depth = 1;
            } else if (started) {
                if (isFence) {
                    depth += line.trim() === '```' ? -1 : 1;
                    if (depth === 0) break;
                }
                codeLines.push(line);
            }
        }

        return started && codeLines.length > 0 ? codeLines.join('\n').trim() : content.trim();
    };

    const handleSubmit = async () => {
        if (!message.trim() || loading) return;

        const userMsg = message.trim();
        setMessage('');
        setLoading(true);

        const newHistory = [...history, { role: 'user', content: userMsg }];
        setHistory(newHistory);

        let samples = null;
        if (includeContext && selectedProjectId) {
            try { samples = await fetchStateSamples(selectedProjectId, 5); }
            catch (e) { /* ignore */ }
        }

        const context = newHistory.slice(-10)
            .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
            .join('\n\n');

        const result = await chatCompletion(
            selectedFile?.format || 'mako',
            userMsg,
            selectedFile?.content || '',
            samples,
            model,
            context
        );

        setLoading(false);
        if (result) {
            setHistory([...newHistory, { role: 'assistant', content: result.content }]);
        }
    };

    const apply = (content) => {
        if (selectedFile) setSelectedFileContent(extractCode(content));
    };

    const copy = (content, idx) => {
        navigator.clipboard.writeText(extractCode(content) || content);
        setCopied(idx);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className={`flex flex-col h-full ${theme.bg}`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-2 border-b ${theme.border}`}>
                <div className="flex items-center gap-2">
                    <SparklesIcon className={`w-4 h-4 ${theme.textAccent}`}/>
                    <span className={`${theme.text} font-medium text-sm`}>AI Assistant</span>
                </div>
                {history.length > 0 && (
                    <button onClick={() => setHistory([])} className={`${theme.hover} ${theme.text} p-1`} title="Clear">
                        <Trash2Icon className="w-4 h-4"/>
                    </button>
                )}
            </div>

            {/* Options */}
            <div className={`p-2 border-b ${theme.border} space-y-2`}>
                <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className={`w-full ${theme.bg} ${theme.text} border ${theme.border} px-2 py-1 text-xs`}
                >
                    {models.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <TerminalToggle
                    checked={includeContext}
                    onChange={setIncludeContext}
                    label="Include state context"
                    size="small"
                />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-2 space-y-2">
                {history.length === 0 && !loading && (
                    <div className={`${theme.textMuted} text-xs`}>
                        Ask the AI to help with your template.
                        {selectedFile && <p className={`mt-1 ${theme.textAccent}`}>{selectedFile.name}</p>}
                        {!selectedFile && <p className={`mt-1 text-red-500`}>No file selected.</p>}
                    </div>
                )}

                {history.map((msg, i) => (
                    <div key={i}>
                        <div className={`text-xs ${theme.textMuted} mb-1`}>
                            {msg.role === 'user' ? 'You' : 'AI'}
                        </div>
                        <div className={`border ${theme.border} p-2 text-xs ${msg.role === 'user' ? 'text-amber-300' : theme.text}`}>
                            <pre className="whitespace-pre-wrap overflow-auto">{msg.content}</pre>
                            {msg.role === 'assistant' && (
                                <div className={`flex gap-2 mt-2 pt-2 border-t ${theme.border}`}>
                                    <button
                                        onClick={() => apply(msg.content)}
                                        className={`flex-1 ${theme.hover} border ${theme.border} ${theme.text} px-2 py-1 text-xs`}
                                    >
                                        Apply
                                    </button>
                                    <button
                                        onClick={() => copy(msg.content, i)}
                                        className={`${theme.hover} border ${theme.border} ${theme.text} px-2 py-1 text-xs`}
                                    >
                                        {copied === i ? <CheckIcon className="w-3 h-3"/> : <CopyIcon className="w-3 h-3"/>}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex items-center gap-2">
                        <RefreshCwIcon className={`w-4 h-4 animate-spin ${theme.textAccent}`}/>
                        <span className={`text-xs ${theme.textMuted}`}>Thinking...</span>
                    </div>
                )}
                <div ref={chatEndRef}/>
            </div>

            {/* Input */}
            <div className={`p-2 border-t ${theme.border}`}>
                <div className="flex gap-2">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSubmit())}
                        placeholder="Ask AI..."
                        className={`flex-1 ${theme.bg} ${theme.text} border ${theme.border} px-2 py-1 text-xs resize-none`}
                        rows={2}
                        disabled={loading || !selectedFile}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !message.trim() || !selectedFile}
                        className={`${theme.hover} border ${theme.border} disabled:opacity-50 ${theme.text} px-3`}
                    >
                        <SendIcon className="w-3 h-3"/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIAssistantTab;