import React, {useCallback, useEffect, useRef} from 'react';
// import {loader} from "@monaco-editor/react";
// import Editor from '@monaco-editor/react';
import {Dialog, Transition} from "@headlessui/react";


const StateDataFilterDialog = ({isOpen, setIsOpen, filterId, direction = "input" }) => {
    // const editorRef = useRef(null);
    // const initialized = useRef(false)

    const monacoRef = useRef(null);

    const initialValue =  `{
    "filter_items": {
        "first_name": {
            "key": "first_name",
            "operator": "EQ",
            "value": "bob"
        },
        "last_name": {
            "key": "last_name",
            "operator": "EQ",
            "value": "smith"
        }
    }
}`

    // Define the JSON schema for our filter structure
    const filterSchema = {
        type: 'object',
        properties: {
            filter_items: {
                type: 'object',
                default: {
                    "field_name": {
                        key: "[field name to filter on]",
                        value: "[field value to filter for]",
                        operator: "EQ"
                    }
                },
                additionalProperties: {
                    type: 'object',
                    default: {
                        key: "[field name to filter on]",
                        value: "[field value to filter for]",
                        operator: "EQ"
                    },
                    properties: {
                        key: { type: 'string', default: "[field name]" },
                        operator: { type: 'string', enum: ['RE', 'NE', 'EQ', 'LT', 'GT'] },
                        value: { type: 'string' }
                    },
                    required: ['key', 'operator', 'value']
                }
            }
        },
        required: ['filter_items']
    };

    // useEffect(() => {
    //     // if (initialized.current || !isOpen) {
    //     //     return
    //     // }
    //
    //     if (!isOpen)
    //         return
    //
    //     initialized.current = true
    //
    //     loader.init().then(monaco => {
    //         // Ensure JSON language support is loaded
    //         import('monaco-editor/esm/vs/language/json/monaco.contribution');
    //
    //--schema
    //
    //         // Set up JSON validation
    //         monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    //             validate: false,
    //             schemas: [{
    //                 // uri: "http://myserver/filter-schema.json",
    //                 fileMatch: ['*'],
    //                 schema: filterSchema
    //             }]
    //         });
    //
    //         // Create editor
    //         editorRef.current = monaco.editor.create(document.getElementById('filter-editor-container'), {
    //             value: initialValue,
    //             language: 'json',
    //             theme: 'vs-dark',
    //             minimap: { enabled: false },
    //             automaticLayout: true,
    //             formatOnPaste: true,
    //             formatOnType: true,
    //             scrollBeyondLastLine: false,
    //             lineNumbers: 'on',
    //             roundedSelection: false,
    //             readOnly: false,
    //             cursorStyle: 'line',
    //             selectOnLineNumbers: true,
    //             folding: true,
    //         });
    //
    //         // Set up change event
    //         editorRef.current.onDidChangeModelContent(() => {
    //             // onChange(editorRef.current.getValue());
    //         });
    //     });
    //
    //     return () => {
    //         if (editorRef.current) {
    //             initialized.current = null
    //             editorRef.current.dispose();
    //         }
    //     };
    // }, [isOpen]);

    function handleEditorWillMount(monaco) {
        // here is the monaco instance
        // do something before editor is mounted
        // monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
            validate: false,
            schemas: [{
                // uri: "http://myserver/filter-schema.json",
                fileMatch: ['*'],
                schema: filterSchema
            }]
        });
    }

    const handleEditorDidMount = useCallback((editor, monaco) => {
        monacoRef.current = monaco;

        // monaco.languages.registerCompletionItemProvider('python', {
        //     provideCompletionItems: (model, position) => {
        //         const wordInfo = model.getWordUntilPosition(position);
        //         const wordRange = new monaco.Range(
        //             position.lineNumber,
        //             wordInfo.startColumn,
        //             position.lineNumber,
        //             wordInfo.endColumn
        //         );
        //
        //         return {
        //             suggestions: createDependencyProposals(wordRange)
        //         };
        //     }
        // });
    }, []);


    const onClose = () => {
        setIsOpen(false)
    }

    return (
        <Transition appear show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
                <Transition.Child
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex justify-center p-4">
                        <Transition.Child
                            as={React.Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95">

                            <Dialog.Panel
                                className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                    Filter Definition ({direction})
                                </Dialog.Title>

                                {/*<Editor*/}
                                {/*    height="90vh"*/}
                                {/*    defaultLanguage="json"*/}
                                {/*    defaultValue={initialValue}*/}
                                {/*    beforeMount={handleEditorWillMount}*/}
                                {/*    onMount={handleEditorDidMount}*/}
                                {/*/>*/}

                                {/*<div id="filter-editor-container" style={{width: '100%', height: '400px'}}/>*/}
                                {/*<Editor*/}
                                {/*    className="mt-1 block h-96 w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"*/}
                                {/*    defaultLanguage="python"*/}
                                {/*    value={templateContent}*/}
                                {/*    onChange={(newValue) => setTemplateContent(newValue)}*/}
                                {/*    onMount={onEditorMount}*/}
                                {/*    options={{*/}
                                {/*        minimap: { enabled: false },*/}
                                {/*        scrollBeyondLastLine: false,*/}
                                {/*        // Add more options as needed*/}
                                {/*    }}*/}
                                {/*/>*/}

                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                                        onClick={onClose}>
                                        Close
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
};

export default StateDataFilterDialog;