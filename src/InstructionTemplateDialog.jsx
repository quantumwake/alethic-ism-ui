import React, {useEffect, useState} from "react";
import { Dialog, Transition } from "@headlessui/react";
import useStore from "./store";
import {MinusCircleIcon} from "@heroicons/react/24/outline";
import Editor from '@monaco-editor/react';

function InstructionTemplateDialog({ isOpen, setIsOpen }) {

    const [templateId, setTemplateId] = useState('');
    const [templatePath, setTemplatePath] = useState('');
    const [templateType, setTemplateType] = useState('');
    const [templateContent, setTemplateContent] = useState('');
    const {templates, createTemplate, getTemplate, selectedProjectId} = useStore();

    const onClose = () => {
        // Implement discard functionality here
        setIsOpen(false);
    };

    const onAddTemplate = (e) => {
        // Create a new item object with the current form values and the selected project ID
        const newItem = {
            template_id: templateId,
            template_path: templatePath,
            template_type: templateType,
            template_content: templateContent,
            project_id: selectedProjectId
        };

        // Update the projectInstructionTemplates state with the new item
        createTemplate(newItem).then(r => {
            setTemplateId('')
            setTemplatePath('')
            setTemplateContent('')
            setTemplateType('')
        })
    };

    const onDeleteTemplate = (e) => {

    };

    const onEditTemplate = (id) => {
        const template = getTemplate(id)

        setTemplateId(template.template_id)
        setTemplatePath(template.template_path)
        setTemplateType(template.template_type)
        setTemplateContent(template.template_content)
    }

    const onEditorMount = (editor, monaco) => {
        // console.log('editorDidMount', editor);
        editor.focus();
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
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={React.Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel
                                className="w-full max-w-screen-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                    Instructions
                                </Dialog.Title>
                                <div className="mt-2">
                                    <div className="shadow overflow-hidden sm:rounded-md">
                                        <div className="px-4 py-5 bg-white sm:p-6">
                                            <div className="grid grid-cols-6 gap-6">
                                                {/* Template Path Input */}
                                                <div className="col-span-6 sm:col-span-3">
                                                    <label htmlFor="template_path"
                                                           className="block text-sm font-medium text-gray-700">
                                                        Template Path
                                                    </label>
                                                    <input
                                                        id="template_id"
                                                        name="template_id"
                                                        type="hidden"
                                                        value={templateId}
                                                    />
                                                    <input
                                                        id="template_path"
                                                        name="template_path"
                                                        type="text"
                                                        value={templatePath}
                                                        required
                                                        onChange={(e) => setTemplatePath(e.target.value)}
                                                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                    />
                                                </div>
                                                {/* Template Type Selector */}
                                                <div className="col-span-6 sm:col-span-3">
                                                    <label htmlFor="template_type"
                                                           className="block text-sm font-medium text-gray-700">
                                                        Template Type
                                                    </label>
                                                    <select
                                                        id="template_type"
                                                        name="template_type"
                                                        value={templateType}
                                                        autoComplete="template-type"
                                                        onChange={(e) => setTemplateType(e.target.value)}
                                                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                                                        <option value=""></option>
                                                        <option value="user_template">User Template</option>
                                                        <option value="system_template">System Template</option>
                                                        <option value="python_code">Python Code</option>
                                                    </select>
                                                </div>
                                                {/* Template Content Textarea */}
                                                <div className="col-span-6">
                                                    <Editor
                                                        className="mt-1 block h-96 w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                        defaultLanguage="python"
                                                        value={templateContent}
                                                        onChange={(newValue, e) => setTemplateContent(newValue)}
                                                        onMount={onEditorMount}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                                            <button
                                                type="button"
                                                onClick={(e) => onAddTemplate(e)}
                                                className="ml-2 inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                    <table className="min-w-full divide-y divide-gray-200 mt-5">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Path
                                            </th>
                                            <th scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Content
                                            </th>
                                            <th scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                        {templates && templates.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                                                        onClick={(e) => onEditTemplate(item.template_id)}>
                                                        {item.template_path}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {item.template_type}
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {item.template_content?.slice(0, 30)}{' '} {/* Truncate to 30 chars */}
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {/* Add New Field Button */}
                                                    <button
                                                        type="button"
                                                        className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                                                        onClick={(e) => onDeleteTemplate(e)}>
                                                        <MinusCircleIcon className="h-4 w-4"/>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                                        onClick={onClose}
                                    >
                                        Close
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

export default InstructionTemplateDialog;
