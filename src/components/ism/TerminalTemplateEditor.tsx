import React, { useRef, useEffect, useState } from 'react';
import { Editor } from "@monaco-editor/react";
import { BugIcon, SaveIcon, Trash2Icon } from 'lucide-react';
import { useStore } from '../../store';
import { TerminalButton } from "../common";
import { ITerminalTemplateEditorProps, TemplateFormat } from '@/types';

// Map completion kinds to Monaco completion item kinds
const kindMap: Record<string, number> = {
    'variable': 5,      // monaco.languages.CompletionItemKind.Variable
    'function': 1,      // monaco.languages.CompletionItemKind.Function
    'method': 0,        // monaco.languages.CompletionItemKind.Method
    'property': 9,      // monaco.languages.CompletionItemKind.Property
    'snippet': 27,      // monaco.languages.CompletionItemKind.Snippet
    'keyword': 17,      // monaco.languages.CompletionItemKind.Keyword
};

// Map template format to Monaco language
const formatToLanguage: Record<TemplateFormat, string> = {
    'mako': 'html',
    'python': 'python',
    'simple': 'html',
    'filter': 'json',
    'lua': 'lua',
};

const TerminalTemplateEditor: React.FC<ITerminalTemplateEditorProps> = ({
    template,
    projectId,
    onContentChange,
    onSave,
    onDelete,
    onTest,
    showToolbar = true,
    readOnly = false,
}) => {
    const theme = useStore(state => state.getCurrentTheme());
    const { fetchEditorCompletions } = useStore();

    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const completionProviderRef = useRef<any>(null);
    const [editorMounted, setEditorMounted] = useState(false);

    // Get language based on template format
    const language = formatToLanguage[template?.template_type as TemplateFormat] || 'html';

    // Setup completion provider after editor is mounted
    useEffect(() => {
        const setupCompletionProvider = async () => {
            if (!monacoRef.current || !template || !projectId || !editorMounted) {
                return;
            }

            // Dispose previous provider if exists
            if (completionProviderRef.current) {
                completionProviderRef.current.dispose();
            }

            const templateType = template?.template_type || 'mako';

            // Fetch completions from API
            const completionData = await fetchEditorCompletions(templateType, projectId);

            if (!completionData) {
                return;
            }

            const monaco = monacoRef.current;

            // Register completion provider for the current language
            completionProviderRef.current = monaco.languages.registerCompletionItemProvider(language, {
                triggerCharacters: ['.', '$', '{', "'", '"'],
                provideCompletionItems: (model: any, position: any) => {
                    const word = model.getWordUntilPosition(position);
                    const range = {
                        startLineNumber: position.lineNumber,
                        endLineNumber: position.lineNumber,
                        startColumn: word.startColumn,
                        endColumn: word.endColumn,
                    };

                    const suggestions = (completionData.completions || []).map((item: any, index: number) => {
                        const isSnippet = item.kind === 'snippet';
                        return {
                            label: item.label,
                            kind: kindMap[item.kind] || kindMap['variable'],
                            insertText: item.insertText || item.label,
                            insertTextRules: isSnippet
                                ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                                : undefined,
                            documentation: item.documentation,
                            detail: item.detail,
                            sortText: item.sortText || String(index).padStart(5, '0'),
                            range: range,
                        };
                    });

                    const keywordSuggestions = (completionData.keywords || []).map((kw: string, index: number) => ({
                        label: kw,
                        kind: kindMap['keyword'],
                        insertText: kw,
                        range: range,
                        sortText: `z${String(index).padStart(5, '0')}`,
                    }));

                    return { suggestions: [...suggestions, ...keywordSuggestions] };
                }
            });
        };

        setupCompletionProvider();
    }, [template, projectId, fetchEditorCompletions, editorMounted, language]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (completionProviderRef.current) {
                completionProviderRef.current.dispose();
            }
        };
    }, []);

    const handleSaveClick = async () => {
        if (onSave) {
            await onSave();
        }
    };

    const handleTestClick = async () => {
        if (onTest) {
            await onTest();
        }
    };

    const handleDeleteClick = async () => {
        if (onDelete) {
            await onDelete();
        }
    };

    if (!template) return null;

    return (
        <div className={`relative flex h-full w-full p-1 ${theme.bg}`}>
            {showToolbar && (
                <div className="z-50 absolute top-2 right-6 flex gap-4">
                    {onSave && (
                        <TerminalButton onClick={handleSaveClick} variant="primary">
                            <SaveIcon className="w-4 h-4" />
                        </TerminalButton>
                    )}

                    {onTest && (
                        <TerminalButton onClick={handleTestClick} variant="primary">
                            <BugIcon className="w-4 h-4" />
                        </TerminalButton>
                    )}

                    {onDelete && (
                        <TerminalButton onClick={handleDeleteClick} variant="primary">
                            <Trash2Icon className="w-4 h-4" />
                        </TerminalButton>
                    )}
                </div>
            )}

            <Editor
                theme="vs-dark"
                language={language}
                value={template.template_content}
                onChange={(value) => onContentChange(value || '')}
                onMount={(editor, monaco) => {
                    editorRef.current = editor;
                    monacoRef.current = monaco;
                    setEditorMounted(true);
                    editor.focus();
                }}
                options={{
                    lineNumbers: 'on',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: true,
                    fontSize: 14,
                    fontLigatures: true,
                    renderLineHighlight: 'all',
                    cursorStyle: 'line',
                    automaticLayout: true,
                    padding: { top: 10, bottom: 10 },
                    readOnly: readOnly,
                    scrollbar: {
                        vertical: 'visible',
                        horizontal: 'visible',
                        verticalScrollbarSize: 12,
                        horizontalScrollbarSize: 12
                    },
                    suggest: {
                        showMethods: true,
                        showFunctions: true,
                        showConstructors: true,
                        showDeprecated: false,
                        matchOnWordStartOnly: false
                    },
                    wordWrap: 'off',
                    formatOnPaste: true,
                    formatOnType: true
                }}
            />
        </div>
    );
};

export default TerminalTemplateEditor;