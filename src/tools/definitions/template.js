import registry from '../registry.js';

/**
 * Template tools — create, update, list, and assign templates.
 */
export function registerTemplateTools() {

    // ─── Create Template ───────────────────────────────────────────────
    registry.register({
        name: 'create_template',
        description: 'Create a new instruction template (prompt or code). Templates define what processors do.',
        category: 'template',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                template_type: {
                    type: 'string',
                    enum: ['mako', 'jinja2', 'python', 'sql', 'text'],
                    description: 'Template language/type',
                },
                template_content: { type: 'string', description: 'The template content (prompt text, code, etc.)' },
                template_path: { type: 'string', description: 'A human-readable name/path for the template (e.g. "user_prompt", "system_instructions")' },
            },
            required: ['template_type', 'template_content', 'template_path'],
        },
        execute: async (params, store) => {
            const projectId = store.selectedProjectId;
            if (!projectId) return { success: false, error: 'No project selected' };

            const template = {
                template_type: params.template_type,
                template_content: params.template_content,
                template_path: params.template_path,
                project_id: projectId,
            };

            const result = await store.saveTemplate(template);
            if (!result) return { success: false, error: 'Failed to create template' };

            return {
                success: true,
                template_id: result.template_id,
                template_path: result.template_path,
                template_type: result.template_type,
            };
        },
    });

    // ─── Update Template ───────────────────────────────────────────────
    registry.register({
        name: 'update_template',
        description: 'Update the content of an existing template.',
        category: 'template',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                template_id: { type: 'string', description: 'Template ID to update' },
                template_content: { type: 'string', description: 'New template content' },
                template_type: { type: 'string', description: 'Template type (if changing)' },
            },
            required: ['template_id', 'template_content'],
        },
        execute: async (params, store) => {
            const existing = store.getTemplate(params.template_id);
            if (!existing) return { success: false, error: `Template ${params.template_id} not found` };

            const template = {
                ...existing,
                template_content: params.template_content,
                ...(params.template_type ? { template_type: params.template_type } : {}),
            };

            const result = await store.saveTemplate(template);
            if (!result) return { success: false, error: 'Failed to update template' };

            return { success: true, template_id: result.template_id };
        },
    });

    // ─── Get Template ──────────────────────────────────────────────────
    registry.register({
        name: 'get_template',
        description: 'Get the details and content of a template by ID.',
        category: 'template',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                template_id: { type: 'string', description: 'Template ID' },
            },
            required: ['template_id'],
        },
        execute: async (params, store) => {
            const template = store.getTemplate(params.template_id);
            if (!template) return { success: false, error: `Template ${params.template_id} not found in local state. Try list_templates first.` };

            return {
                success: true,
                template_id: template.template_id,
                template_type: template.template_type,
                template_path: template.template_path,
                template_content: template.template_content,
            };
        },
    });

    // ─── List Templates ────────────────────────────────────────────────
    registry.register({
        name: 'list_templates',
        description: 'List all templates in the current project.',
        category: 'template',
        confirm: false,
        parameters: { type: 'object', properties: {}, required: [] },
        execute: async (_params, store) => {
            const projectId = store.selectedProjectId;
            if (!projectId) return { success: false, error: 'No project selected' };

            const templates = await store.fetchTemplates(projectId);

            return {
                success: true,
                count: templates?.length || 0,
                templates: (templates || []).map(t => ({
                    template_id: t.template_id,
                    template_type: t.template_type,
                    template_path: t.template_path,
                })),
            };
        },
    });

    // ─── Assign Template to State ──────────────────────────────────────
    registry.register({
        name: 'assign_template_to_state',
        description: 'Assign a template to a state config slot. For LM states, set user_template_id or system_template_id. For code/DB states, set template_id.',
        category: 'template',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                state_id: { type: 'string', description: 'State node ID' },
                template_id: { type: 'string', description: 'Template ID to assign' },
                slot: {
                    type: 'string',
                    enum: ['user_template_id', 'system_template_id', 'template_id'],
                    description: 'Which config field to set the template on',
                },
            },
            required: ['state_id', 'template_id', 'slot'],
        },
        execute: async (params, store) => {
            const projectId = store.selectedProjectId;
            if (!projectId) return { success: false, error: 'No project selected' };

            const currentData = store.getNodeData(params.state_id);

            // Determine state type based on slot
            let stateType = currentData?.state_type || 'StateConfig';
            if (params.slot === 'user_template_id' || params.slot === 'system_template_id') {
                stateType = 'StateConfigLM';
            } else if (params.slot === 'template_id' && !stateType.includes('Config')) {
                stateType = 'StateConfigCode';
            }

            const stateObject = {
                id: params.state_id,
                state_type: stateType,
                project_id: projectId,
                columns: currentData?.columns || {},
                config: {
                    ...(currentData?.config || {}),
                    storage_class: 'database',
                    [params.slot]: params.template_id,
                },
            };

            const response = await store.authPost('/state/create', stateObject);
            if (!response.ok) return { success: false, error: `Failed to assign template: ${response.status}` };

            const stateData = await response.json();
            store.setNodeData(params.state_id, stateData);

            return { success: true, state_id: params.state_id, [params.slot]: params.template_id };
        },
    });
}

export default registerTemplateTools;
