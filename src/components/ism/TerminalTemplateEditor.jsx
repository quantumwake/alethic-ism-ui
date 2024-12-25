import React, { useState, useRef } from 'react';
import { Editor } from "@monaco-editor/react";
import { Search } from 'lucide-react';
import {useStore} from '../../store';
import TerminalInput from '../common/TerminalInput';
import TerminalDropdown from '../common/TerminalDropdown';

const templateTypes = [
    { id: 'mako', label: 'Mako' },
    { id: 'simple', label: 'Simple' },
    { id: 'python', label: 'Python' },
    { id: 'filter', label: 'Filter' }
];

const TerminalTemplateEditor = () => {
    const theme = useStore(state => state.getCurrentTheme());

    const [templateId, setTemplateId] = useState('');
    const [templatePath, setTemplatePath] = useState('');
    const [templateType, setTemplateType] = useState('');
    const [templateContent, setTemplateContent] = useState('');
    const {createTemplate, selectedProjectId } = useStore();
    const editorRef = useRef(null);

    // const handleTypeSelect = (selected) => {
    //     setTemplateType(selected.id);
    // };

    const handleSave = () => {
        if (!templatePath || !templateType || !templateContent) return;
        const newTemplate = {
            template_id: templateId,
            template_path: templatePath,
            template_type: templateType,
            template_content: templateContent,
            project_id: selectedProjectId
        };

        createTemplate(newTemplate).then(() => {
            setTemplateId('');
            setTemplatePath('');
            setTemplateContent('');
        });
    };

    return (
        <div className="flex h-full w-full">
            <Editor
                defaultLanguage="python"
                value={templateContent}
                onChange={setTemplateContent}
                onMount={(editor) => {
                    editorRef.current = editor;
                    editor.focus();
                }}
                options={{
                    lineNumbers: 'on',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false
                }}
            />
        </div>
    );
};

export default TerminalTemplateEditor;