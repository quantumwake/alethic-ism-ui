import registry from '../registry.js';

/**
 * Processor configuration tools — configure properties, status, provider.
 */
export function registerProcessorTools() {

    // ─── Configure Processor ───────────────────────────────────────────
    registry.register({
        name: 'configure_processor',
        description: 'Set processor properties like temperature, maxTokens, topP, presencePenalty, frequencyPenalty, maxBatchSize, requestDelay.',
        category: 'processor',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                processor_id: { type: 'string', description: 'Processor node ID' },
                properties: {
                    type: 'object',
                    description: 'Key-value properties to set (e.g. temperature, maxTokens, topP)',
                    properties: {
                        temperature: { type: 'number', description: 'Randomness (0-2, default 0.7)' },
                        maxTokens: { type: 'integer', description: 'Max output tokens (default 2048)' },
                        topP: { type: 'number', description: 'Nucleus sampling (0-1, default 1.0)' },
                        presencePenalty: { type: 'number', description: 'Presence penalty (-2 to 2, default 0)' },
                        frequencyPenalty: { type: 'number', description: 'Frequency penalty (-2 to 2, default 0)' },
                        maxBatchSize: { type: 'integer', description: 'Max batch size (default 100)' },
                        requestDelay: { type: 'integer', description: 'Delay between requests in ms (default 0)' },
                    },
                },
            },
            required: ['processor_id', 'properties'],
        },
        execute: async (params, store) => {
            const projectId = store.selectedProjectId;
            if (!projectId) return { success: false, error: 'No project selected' };

            const currentData = store.getNodeData(params.processor_id);
            if (!currentData) return { success: false, error: `Processor ${params.processor_id} not found` };

            const processorObject = {
                id: params.processor_id,
                provider_id: currentData.provider_id,
                status: currentData.status || 'CREATED',
                project_id: projectId,
                name: currentData.name || '',
                class_name: currentData.class_name || '',
                properties: {
                    ...(currentData.properties || {}),
                    ...params.properties,
                },
            };

            const response = await store.authPost('/processor/create', processorObject);
            if (!response.ok) return { success: false, error: `Failed to configure processor: ${response.status}` };

            const updatedData = await response.json();
            if (!updatedData.properties) updatedData.properties = {};
            store.setNodeData(params.processor_id, updatedData);

            return { success: true, processor_id: params.processor_id, properties: params.properties };
        },
    });

    // ─── Change Processor Status ───────────────────────────────────────
    registry.register({
        name: 'change_processor_status',
        description: 'Change the status of a processor. Use "ROUTE" to start processing, "TERMINATE" to stop, "CREATED" to reset.',
        category: 'processor',
        confirm: true,
        parameters: {
            type: 'object',
            properties: {
                processor_id: { type: 'string', description: 'Processor node ID' },
                status: {
                    type: 'string',
                    enum: ['CREATED', 'ROUTE', 'TERMINATE', 'STOPPED'],
                    description: 'New status code',
                },
            },
            required: ['processor_id', 'status'],
        },
        execute: async (params, store) => {
            const result = await store.changeProcessorStatus(params.processor_id, params.status);
            return {
                success: true,
                processor_id: params.processor_id,
                new_status: params.status,
                result,
            };
        },
    });

    // ─── Get Processor ─────────────────────────────────────────────────
    registry.register({
        name: 'get_processor',
        description: 'Get full details of a processor including its properties, status, and provider.',
        category: 'processor',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                processor_id: { type: 'string', description: 'Processor node ID' },
            },
            required: ['processor_id'],
        },
        execute: async (params, store) => {
            const data = await store.fetchProcessor(params.processor_id, true);
            if (!data) return { success: false, error: `Processor ${params.processor_id} not found` };

            return {
                success: true,
                processor_id: params.processor_id,
                status: data.status,
                provider_id: data.provider_id,
                class_name: data.class_name,
                properties: data.properties,
                name: data.name,
            };
        },
    });

    // ─── Set Processor Provider ────────────────────────────────────────
    registry.register({
        name: 'set_processor_provider',
        description: 'Assign a provider (API key configuration) to a processor.',
        category: 'processor',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                processor_id: { type: 'string', description: 'Processor node ID' },
                provider_id: { type: 'string', description: 'Provider ID to assign' },
            },
            required: ['processor_id', 'provider_id'],
        },
        execute: async (params, store) => {
            const projectId = store.selectedProjectId;
            if (!projectId) return { success: false, error: 'No project selected' };

            const currentData = store.getNodeData(params.processor_id);
            if (!currentData) return { success: false, error: `Processor ${params.processor_id} not found` };

            const processorObject = {
                id: params.processor_id,
                provider_id: params.provider_id,
                status: currentData.status || 'CREATED',
                project_id: projectId,
                name: currentData.name || '',
                class_name: currentData.class_name || '',
                properties: currentData.properties || {},
            };

            const response = await store.authPost('/processor/create', processorObject);
            if (!response.ok) return { success: false, error: `Failed to set provider: ${response.status}` };

            const updatedData = await response.json();
            if (!updatedData.properties) updatedData.properties = {};
            store.setNodeData(params.processor_id, updatedData);

            return { success: true, processor_id: params.processor_id, provider_id: params.provider_id };
        },
    });
}

export default registerProcessorTools;
