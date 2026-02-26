import registry from '../registry.js';

/**
 * State configuration tools — configure state types, flags, columns, keys.
 */
export function registerStateTools() {

    // ─── Configure State ───────────────────────────────────────────────
    registry.register({
        name: 'configure_state',
        description: 'Set the state configuration type and properties. Use this to set StateConfig, StateConfigLM, StateConfigCode, etc.',
        category: 'state',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                state_id: { type: 'string', description: 'State node ID' },
                state_type: {
                    type: 'string',
                    enum: ['StateConfig', 'StateConfigLM', 'StateConfigDB', 'StateConfigCode', 'StateConfigVisual', 'StateConfigAudio', 'StateConfigStream', 'StateConfigUserInput'],
                    description: 'The state configuration type',
                },
                config: {
                    type: 'object',
                    description: 'Configuration object with type-specific fields (e.g. user_template_id, system_template_id, template_id, primary_key, etc.)',
                },
            },
            required: ['state_id'],
        },
        execute: async (params, store) => {
            const projectId = store.selectedProjectId;
            if (!projectId) return { success: false, error: 'No project selected' };

            // Fetch current state data
            const currentData = store.getNodeData(params.state_id);

            const stateObject = {
                id: params.state_id,
                state_type: params.state_type || currentData?.state_type || 'StateConfig',
                project_id: projectId,
                columns: currentData?.columns || {},
                config: {
                    ...(currentData?.config || {}),
                    ...(params.config || {}),
                    storage_class: 'database',
                },
            };

            const response = await store.authPost('/state/create', stateObject);
            if (!response.ok) return { success: false, error: `Failed to configure state: ${response.status}` };

            const stateData = await response.json();
            store.setNodeData(params.state_id, stateData);

            return { success: true, state_id: params.state_id, state_type: stateObject.state_type };
        },
    });

    // ─── Configure State LM ────────────────────────────────────────────
    registry.register({
        name: 'configure_state_lm',
        description: 'Configure a state for LLM/AI processing by setting StateConfigLM with user template and optional system template.',
        category: 'state',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                state_id: { type: 'string', description: 'State node ID (this should be the OUTPUT state of the processor)' },
                user_template_id: { type: 'string', description: 'Template ID for the user/instruction prompt' },
                system_template_id: { type: 'string', description: 'Template ID for the system prompt (optional)' },
            },
            required: ['state_id', 'user_template_id'],
        },
        execute: async (params, store) => {
            const projectId = store.selectedProjectId;
            if (!projectId) return { success: false, error: 'No project selected' };

            const currentData = store.getNodeData(params.state_id);

            const stateObject = {
                id: params.state_id,
                state_type: 'StateConfigLM',
                project_id: projectId,
                columns: currentData?.columns || {},
                config: {
                    ...(currentData?.config || {}),
                    storage_class: 'database',
                    user_template_id: params.user_template_id,
                    ...(params.system_template_id ? { system_template_id: params.system_template_id } : {}),
                },
            };

            const response = await store.authPost('/state/create', stateObject);
            if (!response.ok) return { success: false, error: `Failed to configure StateConfigLM: ${response.status}` };

            const stateData = await response.json();
            store.setNodeData(params.state_id, stateData);

            return { success: true, state_id: params.state_id, state_type: 'StateConfigLM', user_template_id: params.user_template_id };
        },
    });

    // ─── Set State Flag ────────────────────────────────────────────────
    registry.register({
        name: 'set_state_flag',
        description: 'Set a boolean flag on a state node. Common flags: flag_append_to_session, flag_dedup_drop_enabled, flag_enable_execute_set, flag_flatten_on_save, flag_keep_raw_output, flag_include_provider_info, flag_require_primary_key, flag_query_state_inheritance_all, flag_include_prompts_in_state, flag_auto_save_output_state, flag_auto_route_output_state.',
        category: 'state',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                state_id: { type: 'string', description: 'State node ID' },
                flag_name: {
                    type: 'string',
                    description: 'Name of the flag to set',
                },
                value: { type: 'boolean', description: 'Flag value (true/false)' },
            },
            required: ['state_id', 'flag_name', 'value'],
        },
        execute: async (params, store) => {
            const projectId = store.selectedProjectId;
            if (!projectId) return { success: false, error: 'No project selected' };

            const currentData = store.getNodeData(params.state_id);

            const stateObject = {
                id: params.state_id,
                state_type: currentData?.state_type || 'StateConfig',
                project_id: projectId,
                columns: currentData?.columns || {},
                config: {
                    ...(currentData?.config || {}),
                    storage_class: 'database',
                    [params.flag_name]: params.value,
                },
            };

            const response = await store.authPost('/state/create', stateObject);
            if (!response.ok) return { success: false, error: `Failed to set flag: ${response.status}` };

            const stateData = await response.json();
            store.setNodeData(params.state_id, stateData);

            return { success: true, state_id: params.state_id, flag: params.flag_name, value: params.value };
        },
    });

    // ─── Set State Columns ─────────────────────────────────────────────
    registry.register({
        name: 'set_state_columns',
        description: 'Define the columns (schema) for a state. Columns define the structure of data in the state.',
        category: 'state',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                state_id: { type: 'string', description: 'State node ID' },
                columns: {
                    type: 'array',
                    description: 'Array of column definitions',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string', description: 'Column name' },
                            type: { type: 'string', description: 'Column type (string, number, boolean, etc.)', default: 'string' },
                            required: { type: 'boolean', description: 'Whether the column is required', default: false },
                        },
                        required: ['name'],
                    },
                },
            },
            required: ['state_id', 'columns'],
        },
        execute: async (params, store) => {
            const projectId = store.selectedProjectId;
            if (!projectId) return { success: false, error: 'No project selected' };

            // Convert array to map keyed by name
            const columnsMap = {};
            for (const col of params.columns) {
                columnsMap[col.name] = {
                    name: col.name,
                    type: col.type || 'string',
                    required: col.required || false,
                };
            }

            const currentData = store.getNodeData(params.state_id);
            const stateObject = {
                id: params.state_id,
                state_type: currentData?.state_type || 'StateConfig',
                project_id: projectId,
                columns: columnsMap,
                config: {
                    ...(currentData?.config || {}),
                    storage_class: 'database',
                },
            };

            const response = await store.authPost('/state/create', stateObject);
            if (!response.ok) return { success: false, error: `Failed to set columns: ${response.status}` };

            const stateData = await response.json();
            store.setNodeData(params.state_id, stateData);

            return { success: true, state_id: params.state_id, column_count: params.columns.length };
        },
    });

    // ─── Set Primary Key ───────────────────────────────────────────────
    registry.register({
        name: 'set_primary_key',
        description: 'Set the primary key columns for a state. Primary keys are used for deduplication and lookups.',
        category: 'state',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                state_id: { type: 'string', description: 'State node ID' },
                keys: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of column names to use as primary key',
                },
            },
            required: ['state_id', 'keys'],
        },
        execute: async (params, store) => {
            const projectId = store.selectedProjectId;
            if (!projectId) return { success: false, error: 'No project selected' };

            const currentData = store.getNodeData(params.state_id);
            const stateObject = {
                id: params.state_id,
                state_type: currentData?.state_type || 'StateConfig',
                project_id: projectId,
                columns: currentData?.columns || {},
                config: {
                    ...(currentData?.config || {}),
                    storage_class: 'database',
                    primary_key: params.keys.map(k => ({ name: k })),
                },
            };

            const response = await store.authPost('/state/create', stateObject);
            if (!response.ok) return { success: false, error: `Failed to set primary key: ${response.status}` };

            const stateData = await response.json();
            store.setNodeData(params.state_id, stateData);

            return { success: true, state_id: params.state_id, primary_key: params.keys };
        },
    });

    // ─── Set Query State Inheritance ───────────────────────────────────
    registry.register({
        name: 'set_query_inheritance',
        description: 'Configure which columns are inherited from input states to output states.',
        category: 'state',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                state_id: { type: 'string', description: 'State node ID' },
                keys: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Column names to inherit',
                },
                inherit_all: { type: 'boolean', description: 'If true, inherit all columns (overrides keys)', default: true },
            },
            required: ['state_id'],
        },
        execute: async (params, store) => {
            const projectId = store.selectedProjectId;
            if (!projectId) return { success: false, error: 'No project selected' };

            const currentData = store.getNodeData(params.state_id);
            const config = {
                ...(currentData?.config || {}),
                storage_class: 'database',
                flag_query_state_inheritance_all: params.inherit_all ?? true,
            };

            if (params.keys && params.keys.length > 0) {
                config.query_state_inheritance = params.keys.map(k => ({ name: k }));
            }

            const stateObject = {
                id: params.state_id,
                state_type: currentData?.state_type || 'StateConfig',
                project_id: projectId,
                columns: currentData?.columns || {},
                config,
            };

            const response = await store.authPost('/state/create', stateObject);
            if (!response.ok) return { success: false, error: `Failed to set inheritance: ${response.status}` };

            const stateData = await response.json();
            store.setNodeData(params.state_id, stateData);

            return { success: true, state_id: params.state_id };
        },
    });

    // ─── Get State ─────────────────────────────────────────────────────
    registry.register({
        name: 'get_state',
        description: 'Get full details of a state node including its config, columns, and flags.',
        category: 'state',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                state_id: { type: 'string', description: 'State node ID' },
            },
            required: ['state_id'],
        },
        execute: async (params, store) => {
            const stateData = await store.fetchState(params.state_id, false);
            if (!stateData) return { success: false, error: `State ${params.state_id} not found` };

            return {
                success: true,
                state_id: params.state_id,
                state_type: stateData.state_type,
                config: stateData.config,
                columns: stateData.columns,
            };
        },
    });
}

export default registerStateTools;
