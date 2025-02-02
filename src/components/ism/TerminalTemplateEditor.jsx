import React, {useRef, useEffect} from 'react';
import { Editor } from "@monaco-editor/react";
import {BugIcon, DeleteIcon, SaveIcon, TestTubeIcon, Trash2Icon} from 'lucide-react';
import {useStore} from '../../store';

import {TerminalButton} from "../../components/common";

const templateTypes = [
    { id: 'mako', label: 'Mako' },
    { id: 'simple', label: 'Simple' },
    { id: 'python', label: 'Python' },
    { id: 'filter', label: 'Filter' }
];

const TerminalTemplateEditor = () => {
    const theme = useStore(state => state.getCurrentTheme());

    const {selectedFile, setSelectedFileContent, saveSelectedFile} = useStore()
    const editorRef = useRef(null);

    useEffect(() => {
        if (!selectedFile) {
            console.warn("selected file changed but no file selected")
        }
    }, [selectedFile]);

    const saveFileClicked = async() => {
        await saveSelectedFile()
    }

    const testFileClicked = async() => {

    }

    const deleteFileClicked = async() => {

    }

    if (!selectedFile) return <></>

    return (
        <div className="relative flex h-full w-full p-1 bg-emerald-950">

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
            {/*// className="z-50 absolute top-2 right-6 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600"*/}

            {/* Monaco Editor */}
            <Editor
                theme="vs-dark"
                defaultLanguage="python"
                value={selectedFile.content}
                onChange={setSelectedFileContent}
                onMount={(editor) => {
                    editorRef.current = editor;
                    editor.focus();
                }}
                options={{
                    lineNumbers: 'on',
                    minimap: {
                        enabled: false
                    },
                    scrollBeyondLastLine: true,
                    fontSize: 14,
                    // fontFamily: "'Fira Code', 'Consolas', monospace",
                    fontLigatures: true,
                    renderLineHighlight: 'all',
                    cursorStyle: 'line',
                    automaticLayout: true,
                    padding: {
                        top: 10,
                        bottom: 10
                    },
                    // rulers: [],
                    // bracketPairColorization: {
                    //     enabled: true
                    // },
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
                }
            }
        />
        </div>
    );
};

export default TerminalTemplateEditor;