import React, { useState, useEffect } from 'react';
import { Plus, Info, Pencil } from 'lucide-react';
import { useStore } from '../../store';
import TerminalDropdown from './TerminalDropdown';
import TerminalButton from './TerminalButton';
import TerminalDialog from './TerminalDialog';
import TerminalInput from './TerminalInput';
import TerminalLabel from './TerminalLabel';
import TerminalTemplateEditor from '../ism/TerminalTemplateEditor.tsx';
import {
    ITemplate,
    ITemplateFieldWithEditorProps,
    TemplateFormat,
} from '@/types';

const templateTypes = [
    { id: 'mako', label: 'Mako' },
    { id: 'simple', label: 'Simple' },
    { id: 'python', label: 'Python' },
    { id: 'filter', label: 'Filter' },
];

const TemplateFieldWithEditor: React.FC<ITemplateFieldWithEditorProps> = ({
    templates,
    selectedTemplateId,
    onSelect,
    placeholder = 'Select template',
    allowEmpty = false,
    projectId,
    onTemplateCreated,
}) => {
    const theme = useStore(state => state.getCurrentTheme());
    const { saveTemplate, getTemplate, updateTemplate, fetchProjectFiles, templates: storeTemplates } = useStore();

    // Dialog states
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isInfoVisible, setIsInfoVisible] = useState(false);

    // Edit dialog state
    const [editingTemplate, setEditingTemplate] = useState<ITemplate | null>(null);
    const [editingContent, setEditingContent] = useState<string>('');

    // Create dialog state
    const [newTemplateName, setNewTemplateName] = useState('');
    const [newTemplateType, setNewTemplateType] = useState<TemplateFormat>('mako');

    // Use store templates for the dropdown to ensure it updates when store changes
    const activeTemplates = storeTemplates.length > 0 ? storeTemplates : templates;

    // Convert templates to dropdown format
    const dropdownValues = activeTemplates.map(t => ({
        id: t.template_id,
        label: t.template_path,
    }));

    // Get the currently selected template
    const selectedTemplate = selectedTemplateId
        ? activeTemplates.find(t => t.template_id === selectedTemplateId)
        : null;

    // Handle dropdown selection - only call onSelect if value actually changed
    const handleDropdownSelect = (value: { id: string | null; label: string }) => {
        if (value.id !== selectedTemplateId) {
            onSelect(value.id);
        }
    };

    // Handle edit button click
    const handleEditClick = () => {
        if (selectedTemplate) {
            setEditingTemplate({ ...selectedTemplate });
            setEditingContent(selectedTemplate.template_content);
            setIsEditDialogOpen(true);
        }
    };

    // Handle create button click
    const handleCreateClick = () => {
        setNewTemplateName('');
        setNewTemplateType('mako');
        setIsCreateDialogOpen(true);
    };

    // Handle info button click
    const handleInfoClick = () => {
        if (selectedTemplateId) {
            navigator.clipboard.writeText(selectedTemplateId);
            setIsInfoVisible(true);
            setTimeout(() => setIsInfoVisible(false), 2000);
        }
    };

    // Handle content change in editor
    const handleContentChange = (content: string) => {
        setEditingContent(content);
    };

    // Handle save in edit dialog
    const handleEditSave = async (): Promise<boolean> => {
        if (!editingTemplate) return false;

        try {
            const updatedTemplate: ITemplate = {
                ...editingTemplate,
                template_content: editingContent,
            };

            const success = await saveTemplate(updatedTemplate);
            if (success) {
                setIsEditDialogOpen(false);
                setEditingTemplate(null);
            }
            return success;
        } catch (error) {
            console.error('Failed to save template:', error);
            return false;
        }
    };

    // Handle create new template
    const handleCreateTemplate = async () => {
        if (!newTemplateName.trim()) return;

        try {
            const newTemplate: ITemplate = {
                template_id: '', // Will be assigned by server
                template_path: newTemplateName,
                template_content: '',
                template_type: newTemplateType,
                project_id: projectId,
            };

            const createdTemplate = await saveTemplate(newTemplate);
            if (createdTemplate) {
                setIsCreateDialogOpen(false);

                // Refresh the file tree to show the new template
                await fetchProjectFiles();

                // Select the newly created template
                onSelect(createdTemplate.template_id);
                onTemplateCreated?.(createdTemplate);
            }
        } catch (error) {
            console.error('Failed to create template:', error);
        }
    };

    // Close edit dialog
    const handleEditDialogClose = () => {
        setIsEditDialogOpen(false);
        setEditingTemplate(null);
        setEditingContent('');
    };

    // Close create dialog
    const handleCreateDialogClose = () => {
        setIsCreateDialogOpen(false);
        setNewTemplateName('');
    };

    return (
        <div className="flex flex-col gap-1">
            {/* Template dropdown - key forces re-render when templates change */}
            <TerminalDropdown
                key={`template-dropdown-${activeTemplates.length}-${selectedTemplateId || 'none'}`}
                values={dropdownValues}
                onSelect={handleDropdownSelect}
                defaultValue={selectedTemplateId}
                placeholder={placeholder}
                allowEmpty={allowEmpty}
            />

            {/* Action buttons - below dropdown */}
            <div className="flex items-center gap-1">
                {/* Create new template */}
                <TerminalButton
                    onClick={handleCreateClick}
                    variant="ghost"
                    size="small"
                    title="Create new template"
                >
                    <Plus className="w-3 h-3" />
                </TerminalButton>

                {/* Show template ID / Copy to clipboard */}
                <div className="relative">
                    <TerminalButton
                        onClick={handleInfoClick}
                        variant="ghost"
                        size="small"
                        disabled={!selectedTemplateId}
                        title={selectedTemplateId ? `Copy ID: ${selectedTemplateId}` : 'No template selected'}
                    >
                        <Info className="w-3 h-3" />
                    </TerminalButton>
                    {isInfoVisible && (
                        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs ${theme.bg} ${theme.border} border whitespace-nowrap z-50`}>
                            Copied!
                        </div>
                    )}
                </div>

                {/* Edit selected template */}
                <TerminalButton
                    onClick={handleEditClick}
                    variant="ghost"
                    size="small"
                    disabled={!selectedTemplateId}
                    title="Edit template"
                >
                    <Pencil className="w-3 h-3" />
                </TerminalButton>
            </div>

            {/* Edit Template Dialog */}
            <TerminalDialog
                isOpen={isEditDialogOpen}
                onClose={handleEditDialogClose}
                title={`Edit: ${editingTemplate?.template_path || ''}`}
                width="w-full max-w-5xl"
            >
                <div style={{ height: '70vh', minHeight: '400px' }}>
                    {editingTemplate && (
                        <TerminalTemplateEditor
                            template={{
                                ...editingTemplate,
                                template_content: editingContent,
                            }}
                            projectId={projectId}
                            onContentChange={handleContentChange}
                            onSave={handleEditSave}
                            showToolbar={true}
                            readOnly={false}
                        />
                    )}
                </div>
            </TerminalDialog>

            {/* Create Template Dialog */}
            <TerminalDialog
                isOpen={isCreateDialogOpen}
                onClose={handleCreateDialogClose}
                title="Create New Template"
            >
                <div className="flex flex-col gap-4">
                    <div>
                        <TerminalLabel description="Template type">Type</TerminalLabel>
                        <TerminalDropdown
                            values={templateTypes}
                            onSelect={(value) => setNewTemplateType(value.id as TemplateFormat)}
                            defaultValue={newTemplateType}
                            placeholder="Select template type"
                        />
                    </div>

                    <div>
                        <TerminalLabel description="Template name/path">Name</TerminalLabel>
                        <TerminalInput
                            name="templateName"
                            value={newTemplateName}
                            onChange={(e) => setNewTemplateName(e.target.value)}
                            placeholder="Enter template name..."
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <TerminalButton variant="ghost" onClick={handleCreateDialogClose}>
                            Cancel
                        </TerminalButton>
                        <TerminalButton
                            variant="primary"
                            onClick={handleCreateTemplate}
                            disabled={!newTemplateName.trim()}
                        >
                            Create
                        </TerminalButton>
                    </div>
                </div>
            </TerminalDialog>
        </div>
    );
};

export default TemplateFieldWithEditor;
