import React, {useRef, useEffect, useState} from 'react';
import { Editor } from "@monaco-editor/react";
import {BugIcon, SaveIcon, Trash2Icon} from 'lucide-react';
import {useStore} from '../../store';
import {TerminalButton} from "../../components/common";

const templateTypes = [
    { id: 'mako', label: 'Mako' },
    { id: 'simple', label: 'Simple' },
    { id: 'python', label: 'Python' },
    { id: 'filter', label: 'Filter' }
];

// Map completion kinds to Monaco completion item kinds
const kindMap = {
    'variable': 5,      // monaco.languages.CompletionItemKind.Variable
    'function': 1,      // monaco.languages.CompletionItemKind.Function
    'method': 0,        // monaco.languages.CompletionItemKind.Method
    'property': 9,      // monaco.languages.CompletionItemKind.Property
    'snippet': 27,      // monaco.languages.CompletionItemKind.Snippet
    'keyword': 17,      // monaco.languages.CompletionItemKind.Keyword
};

// Map template format to Monaco language
const formatToLanguage = {
    'mako': 'html',
    'python': 'python',
    'simple': 'html',
    'filter': 'json',
};

const TerminalTemplateEditor = () => {
    const theme = useStore(state => state.getCurrentTheme());
    const {
        selectedFile,
        setSelectedFileContent,
        saveSelectedFile,
        fetchEditorCompletions,
        selectedProjectId
    } = useStore();

    const editorRef = useRef(null);
    const monacoRef = useRef(null);
    const completionProviderRef = useRef(null);
    const [editorMounted, setEditorMounted] = useState(false);

    useEffect(() => {
        if (!selectedFile) {
            console.warn("selected file changed but no file selected");
        }
    }, [selectedFile]);

    // Get language based on template format
    const language = formatToLanguage[selectedFile?.format] || 'html';

    // Setup completion provider after editor is mounted
    useEffect(() => {
        const setupCompletionProvider = async () => {
            if (!monacoRef.current || !selectedFile || !selectedProjectId || !editorMounted) {
                return;
            }

            // Dispose previous provider if exists
            if (completionProviderRef.current) {
                completionProviderRef.current.dispose();
            }

            const templateType = selectedFile?.format || 'mako';

            // Fetch completions from API
            const completionData = await fetchEditorCompletions(templateType, selectedProjectId);

            if (!completionData) {
                return;
            }

            const monaco = monacoRef.current;

            // Register completion provider for the current language
            completionProviderRef.current = monaco.languages.registerCompletionItemProvider(language, {
                triggerCharacters: ['.', '$', '{', "'", '"'],
                provideCompletionItems: (model, position) => {
                    const word = model.getWordUntilPosition(position);
                    const range = {
                        startLineNumber: position.lineNumber,
                        endLineNumber: position.lineNumber,
                        startColumn: word.startColumn,
                        endColumn: word.endColumn,
                    };

                    const suggestions = (completionData.completions || []).map((item, index) => {
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

                    const keywordSuggestions = (completionData.keywords || []).map((kw, index) => ({
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
    }, [selectedFile, selectedProjectId, fetchEditorCompletions, editorMounted, language]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (completionProviderRef.current) {
                completionProviderRef.current.dispose();
            }
        };
    }, []);

    const saveFileClicked = async() => {
        await saveSelectedFile();
    };

    const testFileClicked = async() => {};
    const deleteFileClicked = async() => {};

    if (!selectedFile) return <></>;

    return (
        <div className={`relative flex h-full w-full p-1 ${theme.bg}`}>
            <div className="z-50 absolute top-2 right-6 flex gap-4">
                {/* Floating Save Button */}
                <TerminalButton onClick={saveFileClicked} variant="primary">
                    <SaveIcon className="w-4 h-4"/>
                </TerminalButton>

                {/* Floating Test Validation Button */}
                <TerminalButton onClick={testFileClicked} variant="primary">
                    <BugIcon className="w-4 h-4"/>
                </TerminalButton>

                {/* Floating Delete Button */}
                <TerminalButton onClick={deleteFileClicked} variant="primary">
                    <Trash2Icon className="w-4 h-4"/>
                </TerminalButton>
            </div>

            {/* Monaco Editor */}
            <Editor
                theme="vs-dark"
                language={language}
                value={selectedFile.content}
                onChange={setSelectedFileContent}
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