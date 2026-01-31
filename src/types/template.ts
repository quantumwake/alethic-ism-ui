/** Template types supported by the editor */
export type TemplateFormat = 'mako' | 'simple' | 'python' | 'filter' | 'lua';

/** Core template data - aligns with InstructionTemplate from store */
export interface ITemplate {
    template_id: string;
    template_path: string;
    template_content: string;
    template_type: TemplateFormat;
    project_id: string;
}

/** Props for the controlled TerminalTemplateEditor */
export interface ITerminalTemplateEditorProps {
    /** The template being edited */
    template: ITemplate;

    /** Project ID for fetching completions */
    projectId: string;

    /** Called when content changes */
    onContentChange: (content: string) => void;

    /** Called when save is requested - returns success */
    onSave?: () => Promise<boolean>;

    /** Called when delete is requested */
    onDelete?: () => Promise<void>;

    /** Called when test/validate is requested */
    onTest?: () => Promise<void>;

    /** Show the floating toolbar (save/test/delete buttons) */
    showToolbar?: boolean;

    /** Read-only mode */
    readOnly?: boolean;
}

/** Props for the TemplateFieldWithEditor component */
export interface ITemplateFieldWithEditorProps {
    /** Available templates to select from */
    templates: ITemplate[];

    /** Currently selected template ID */
    selectedTemplateId?: string;

    /** Called when selection changes */
    onSelect: (templateId: string | null) => void;

    /** Dropdown placeholder text */
    placeholder?: string;

    /** Allow empty/null selection */
    allowEmpty?: boolean;

    /** Project ID for creating new templates and fetching completions */
    projectId: string;

    /** Called after a new template is created */
    onTemplateCreated?: (template: ITemplate) => void;
}

/** Props for the template create dialog */
export interface ITemplateCreateDialogProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    onCreated: (template: ITemplate) => void;
}

/** Props for the template edit dialog */
export interface ITemplateEditDialogProps {
    isOpen: boolean;
    onClose: () => void;
    template: ITemplate | null;
    projectId: string;
    onSaved?: (template: ITemplate) => void;
}
