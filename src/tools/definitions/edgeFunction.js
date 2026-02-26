import registry from '../registry.js';

/**
 * Edge function tools — configure calibrators, validators, transformers, filters on edges.
 */
export function registerEdgeFunctionTools() {

    // ─── Set Edge Function ─────────────────────────────────────────────
    registry.register({
        name: 'set_edge_function',
        description: 'Configure an edge function on a processor-state route. Edge functions can validate, transform, filter, or calibrate data flowing through an edge.',
        category: 'edge_function',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                route_id: { type: 'string', description: 'Processor-state route ID (same as edge ID)' },
                function_type: {
                    type: 'string',
                    enum: ['CALIBRATOR', 'VALIDATOR', 'TRANSFORMER', 'FILTER'],
                    description: 'Type of edge function',
                },
                template_id: { type: 'string', description: 'Template ID containing the function logic' },
                max_attempts: { type: 'integer', description: 'Max retry attempts (for CALIBRATOR type)', default: 3 },
            },
            required: ['route_id', 'function_type'],
        },
        execute: async (params, store) => {
            const config = {
                function_type: params.function_type,
                ...(params.template_id ? { template_id: params.template_id } : {}),
                ...(params.max_attempts != null ? { max_attempts: params.max_attempts } : {}),
            };

            const result = await store.updateEdgeFunctionConfig(params.route_id, config);
            if (!result) return { success: false, error: 'Failed to set edge function' };

            return { success: true, route_id: params.route_id, function_type: params.function_type };
        },
    });

    // ─── Get Edge Function ─────────────────────────────────────────────
    registry.register({
        name: 'get_edge_function',
        description: 'Get the edge function configuration for a processor-state route.',
        category: 'edge_function',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                route_id: { type: 'string', description: 'Processor-state route ID' },
            },
            required: ['route_id'],
        },
        execute: async (params, store) => {
            const config = await store.fetchEdgeFunctionConfig(params.route_id);
            if (!config) return { success: true, route_id: params.route_id, config: null, message: 'No edge function configured' };

            return { success: true, route_id: params.route_id, config };
        },
    });

    // ─── Execute Route (Play Button) ────────────────────────────────────
    registry.register({
        name: 'execute_route',
        description: 'Execute a processor-state route — equivalent to clicking the play button on an edge. This triggers data to flow from the input state through the processor. Pass one or more route/edge IDs.',
        category: 'edge_function',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                route_ids: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'One or more route/edge IDs to execute (e.g. ["e1", "e4"])',
                },
            },
            required: ['route_ids'],
        },
        execute: async (params, store) => {
            const ids = params.route_ids;
            if (!ids || ids.length === 0) {
                return { success: false, error: 'No route IDs provided' };
            }

            const results = [];
            for (const routeId of ids) {
                const ok = await store.executeProcessorStateRoute(routeId);
                results.push({ route_id: routeId, executed: !!ok });
            }

            const allOk = results.every(r => r.executed);
            return {
                success: allOk,
                results,
                message: allOk
                    ? `Executed ${results.length} route(s)`
                    : `Some routes failed to execute`,
            };
        },
    });

    // ─── Execute All Input Routes for a Processor ───────────────────────
    registry.register({
        name: 'execute_processor',
        description: 'Execute all INPUT routes feeding into a processor — triggers all input edges at once. Equivalent to clicking play on every input edge of the processor.',
        category: 'edge_function',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                processor_id: { type: 'string', description: 'The processor node ID (e.g. "p1")' },
            },
            required: ['processor_id'],
        },
        execute: async (params, store) => {
            const processorId = params.processor_id;
            const edges = store.workflowEdges || [];

            // Find all INPUT edges (state → processor) targeting this processor
            const inputEdges = edges.filter(
                e => e.target === processorId && e.type === 'state_auto_stream_playable_edge'
            );

            if (inputEdges.length === 0) {
                return { success: false, error: `No input routes found for processor ${processorId}` };
            }

            const results = [];
            for (const edge of inputEdges) {
                const ok = await store.executeProcessorStateRoute(edge.id);
                results.push({ route_id: edge.id, source: edge.source, executed: !!ok });
            }

            const allOk = results.every(r => r.executed);
            return {
                success: allOk,
                processor_id: processorId,
                routes_executed: results.length,
                results,
            };
        },
    });
}

export default registerEdgeFunctionTools;
