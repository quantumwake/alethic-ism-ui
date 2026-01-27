import React from 'react';
import { useStore } from '../../store';
import TerminalTemplateEditor from './TerminalTemplateEditor';
import { ITemplate, TemplateFormat } from '@/types';

/**
 * Container component that connects TerminalTemplateEditor to the store.
 * Used in the main Editor panel where selectedFile comes from the filesystem slice.
 *
 * This converts the FileTemplate format to ITemplate format for the editor.
 */
const TerminalTemplateEditorContainer: React.FC = () => {
    const {
        selectedFile,
        setSelectedFileContent,
        saveSelectedFile,
        selectedProjectId,
    } = useStore();

    // Don't render if no file is selected
    if (!selectedFile) {
        return null;
    }

    // Convert FileTemplate to ITemplate format
    const template: ITemplate = {
        template_id: selectedFile.id,
        template_path: selectedFile.name,
        template_content: selectedFile.content,
        template_type: selectedFile.format as TemplateFormat,
        project_id: selectedProjectId || '',
    };

    const handleContentChange = (content: string) => {
        setSelectedFileContent(content);
    };

    const handleSave = async (): Promise<boolean> => {
        try {
            await saveSelectedFile();
            return true;
        } catch (error) {
            console.error('Failed to save file:', error);
            return false;
        }
    };

    const handleDelete = async (): Promise<void> => {
        // TODO: Implement delete functionality
        console.warn('Delete not yet implemented');
    };

    const handleTest = async (): Promise<void> => {
        // TODO: Implement test/validate functionality
        console.warn('Test/validate not yet implemented');
    };

    return (
        <TerminalTemplateEditor
            template={template}
            projectId={selectedProjectId || ''}
            onContentChange={handleContentChange}
            onSave={handleSave}
            onDelete={handleDelete}
            onTest={handleTest}
            showToolbar={true}
            readOnly={false}
        />
    );
};

export default TerminalTemplateEditorContainer;