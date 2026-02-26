import registry from '../registry.js';
import autoLayout from '../autoLayout.js';
import { NODE_TYPE_TO_CLASS_NAME, CLASS_NAME_TO_STATE_CONFIG } from '../systemPrompt.js';

/**
 * Determine source/target handles based on relative node positions.
 *
 * Handle convention:
 *   - Top-to-bottom (source above target):  source-4 / target-1
 *   - Left-to-right (source left of target): source-3 / target-2
 *
 * We compare the dominant axis of displacement between the two nodes.
 * If the horizontal distance is larger → left-to-right handles.
 * If the vertical distance is larger → top-to-bottom handles.
 */
function pickHandles(sourceNode, targetNode) {
    const dx = targetNode.position.x - sourceNode.position.x;
    const dy = targetNode.position.y - sourceNode.position.y;

    // Use left-to-right handles when the horizontal displacement dominates
    if (Math.abs(dx) >= Math.abs(dy)) {
        // source is left of target (or same column — default to left-to-right)
        return { sourceHandle: 'source-3', targetHandle: 'target-2' };
    }
    // top-to-bottom
    return { sourceHandle: 'source-4', targetHandle: 'target-1' };
}

/**
 * Find the best matching provider for a given node_type.
 * Uses the NODE_TYPE_TO_CLASS_NAME mapping to match by class_name.
 * Returns the first matching provider, or null.
 */
function findProviderForNodeType(nodeType, providers) {
    const className = NODE_TYPE_TO_CLASS_NAME[nodeType];
    if (!className || !providers?.length) return null;

    // Extract the vendor hint from node_type (e.g. "processor_openai" → "openai")
    const vendorHint = nodeType.replace(/^(processor_|function_)/, '').toLowerCase();

    // Try to match by both class_name and name containing the vendor hint
    const exactMatch = providers.find(
        p => p.class_name === className && p.name.toLowerCase().includes(vendorHint)
    );
    if (exactMatch) return exactMatch;

    // Fallback: match by class_name only (first available)
    return providers.find(p => p.class_name === className) || null;
}

/**
 * Workflow tools — create/delete/move nodes and edges.
 */
export function registerWorkflowTools() {

    // ─── Create State Node ─────────────────────────────────────────────
    registry.register({
        name: 'create_state_node',
        description: 'Create a new data state node on the workflow canvas. States hold tabular data.',
        category: 'workflow',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                label: { type: 'string', description: 'Display label for the state node' },
                position_x: { type: 'number', description: 'X position on canvas (optional, auto-positioned if omitted)' },
                position_y: { type: 'number', description: 'Y position on canvas (optional, auto-positioned if omitted)' },
            },
            required: [],
        },
        execute: async (params, store) => {
            const projectId = store.selectedProjectId;
            if (!projectId) return { success: false, error: 'No project selected' };

            const existingNodes = store.workflowNodes || [];
            const pos = (params.position_x != null && params.position_y != null)
                ? { x: params.position_x, y: params.position_y }
                : autoLayout.getNextPosition({ existingNodes, nodeType: 'state' });

            const nodeData = {
                node_type: 'state',
                node_label: params.label || 'State',
                project_id: projectId,
                position_x: pos.x,
                position_y: pos.y,
                width: 100,
                height: 100,
            };

            const newNode = await store.createStateWithWorkflowNode(nodeData);
            const nodeId = newNode?.id;

            // Set the state config name (createState doesn't propagate node_label → config.name)
            if (nodeId && params.label) {
                const currentData = store.getNodeData(nodeId);
                const stateObject = {
                    id: nodeId,
                    state_type: currentData?.state_type || 'StateConfig',
                    project_id: projectId,
                    columns: currentData?.columns || {},
                    config: {
                        ...(currentData?.config || {}),
                        storage_class: 'database',
                        name: params.label,
                    },
                };
                const response = await store.authPost('/state/create', stateObject);
                if (response.ok) {
                    const stateData = await response.json();
                    store.setNodeData(nodeId, stateData);
                }
            }

            return {
                success: true,
                node_id: nodeId,
                node_type: 'state',
                label: params.label || 'State',
                position: pos,
            };
        },
    });

    // ─── Create Processor Node ─────────────────────────────────────────
    registry.register({
        name: 'create_processor_node',
        description: 'Create a new processor node on the workflow canvas. Processors consume input states and produce output states. A matching provider is automatically assigned based on node_type if one is available. You can also specify a provider_id explicitly.',
        category: 'workflow',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                node_type: {
                    type: 'string',
                    enum: [
                        'processor_openai', 'processor_anthropic', 'processor_google',
                        'processor_googleai', 'processor_mistral', 'processor_llama',
                        'processor_python', 'processor_visual_openai',
                        'processor_state_coalescer', 'processor_state_composite',
                        'processor_provider', 'function_datasource_sql', 'function_user_interaction',
                    ],
                    description: 'The processor type to create',
                },
                label: { type: 'string', description: 'Display label for the node' },
                provider_id: { type: 'string', description: 'Explicit provider ID to assign (optional — auto-matched from node_type if omitted)' },
                position_x: { type: 'number', description: 'X position on canvas' },
                position_y: { type: 'number', description: 'Y position on canvas' },
            },
            required: ['node_type'],
        },
        execute: async (params, store) => {
            const projectId = store.selectedProjectId;
            if (!projectId) return { success: false, error: 'No project selected' };

            const existingNodes = store.workflowNodes || [];
            const pos = (params.position_x != null && params.position_y != null)
                ? { x: params.position_x, y: params.position_y }
                : autoLayout.getNextPosition({ existingNodes, nodeType: params.node_type });

            const nodeData = {
                node_type: params.node_type,
                node_label: params.label || params.node_type,
                project_id: projectId,
                position_x: pos.x,
                position_y: pos.y,
                width: 100,
                height: 100,
            };

            const newNode = await store.createProcessorWithWorkflowNode(nodeData);
            const nodeId = newNode?.id;

            // Auto-assign provider
            let assignedProvider = null;
            if (nodeId) {
                const providers = store.providers || [];
                let provider = null;

                if (params.provider_id) {
                    // Explicit provider
                    provider = providers.find(p => p.id === params.provider_id);
                } else {
                    // Auto-match from node_type
                    provider = findProviderForNodeType(params.node_type, providers);
                }

                if (provider) {
                    // Set provider on node data and persist
                    const currentData = store.getNodeData(nodeId) || {};
                    const processorObject = {
                        id: nodeId,
                        provider_id: provider.id,
                        status: currentData.status || 'CREATED',
                        project_id: projectId,
                        name: currentData.name || '',
                        class_name: provider.class_name,
                        properties: currentData.properties || {},
                    };

                    const response = await store.authPost('/processor/create', processorObject);
                    if (response.ok) {
                        const updatedData = await response.json();
                        if (!updatedData.properties) updatedData.properties = {};
                        store.setNodeData(nodeId, updatedData);
                        assignedProvider = { id: provider.id, name: provider.name, class_name: provider.class_name };
                    }
                }
            }

            return {
                success: true,
                node_id: nodeId,
                node_type: params.node_type,
                label: params.label || params.node_type,
                position: pos,
                provider: assignedProvider,
            };
        },
    });

    // ─── Delete Node ───────────────────────────────────────────────────
    registry.register({
        name: 'delete_node',
        description: 'Delete a node from the workflow canvas. This also removes connected edges.',
        category: 'workflow',
        confirm: true,
        parameters: {
            type: 'object',
            properties: {
                node_id: { type: 'string', description: 'ID of the node to delete' },
            },
            required: ['node_id'],
        },
        execute: async (params, store) => {
            const node = store.getNode(params.node_id);
            if (!node) return { success: false, error: `Node ${params.node_id} not found` };

            // Delete associated processor or state first
            if (node.type?.startsWith('processor') || node.type?.startsWith('function')) {
                await store.deleteProcessor(params.node_id);
            } else if (node.type === 'state') {
                await store.deleteState(params.node_id);
            } else {
                await store.deleteNode(params.node_id);
            }

            return { success: true, deleted_node_id: params.node_id, node_type: node.type };
        },
    });

    // ─── Move Node ─────────────────────────────────────────────────────
    registry.register({
        name: 'move_node',
        description: 'Move/reposition a node on the canvas.',
        category: 'workflow',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                node_id: { type: 'string', description: 'ID of the node to move' },
                position_x: { type: 'number', description: 'New X position' },
                position_y: { type: 'number', description: 'New Y position' },
            },
            required: ['node_id', 'position_x', 'position_y'],
        },
        execute: async (params, store) => {
            const node = store.getNode(params.node_id);
            if (!node) return { success: false, error: `Node ${params.node_id} not found` };

            // Update position in store
            store.setWorkflowNodes(
                store.workflowNodes.map(n =>
                    n.id === params.node_id
                        ? { ...n, position: { x: params.position_x, y: params.position_y } }
                        : n
                )
            );

            // Persist to backend
            await store.updateNode(params.node_id);

            return { success: true, node_id: params.node_id, position: { x: params.position_x, y: params.position_y } };
        },
    });

    // ─── Get Nodes ─────────────────────────────────────────────────────
    registry.register({
        name: 'get_nodes',
        description: 'List all nodes in the current project workflow.',
        category: 'workflow',
        confirm: false,
        parameters: { type: 'object', properties: {}, required: [] },
        execute: async (_params, store) => {
            const nodes = store.workflowNodes || [];
            return {
                success: true,
                count: nodes.length,
                nodes: nodes.map(n => ({
                    id: n.id,
                    type: n.type,
                    label: n.data?.config?.name || n.data?.name || n.data?.label || n.type,
                    group: n.data?.metadata?.group?.name || null,
                    position: n.position,
                })),
            };
        },
    });

    // ─── Get Node Details ──────────────────────────────────────────────
    registry.register({
        name: 'get_node_details',
        description: 'Get full details of a specific node including its data, config, and associated states.',
        category: 'workflow',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                node_id: { type: 'string', description: 'ID of the node' },
            },
            required: ['node_id'],
        },
        execute: async (params, store) => {
            const node = store.getNode(params.node_id);
            if (!node) return { success: false, error: `Node ${params.node_id} not found` };

            // Fetch fresh data from backend
            if (node.type?.startsWith('processor') || node.type?.startsWith('function')) {
                await store.fetchProcessor(params.node_id);
            } else if (node.type === 'state') {
                await store.fetchState(params.node_id, false);
            }

            const data = store.getNodeData(params.node_id);
            return {
                success: true,
                node_id: params.node_id,
                type: node.type,
                position: node.position,
                data: data || {},
            };
        },
    });

    // ─── Create Edge ───────────────────────────────────────────────────
    registry.register({
        name: 'create_edge',
        description: 'Connect a state node to a processor node. Use direction="INPUT" when the state feeds data INTO the processor. Use direction="OUTPUT" when the processor writes results OUT to the state.',
        category: 'workflow',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                state_node_id: { type: 'string', description: 'The state node ID' },
                processor_node_id: { type: 'string', description: 'The processor node ID' },
                direction: {
                    type: 'string',
                    enum: ['INPUT', 'OUTPUT'],
                    description: 'INPUT = state feeds data into processor. OUTPUT = processor writes results to state.',
                },
            },
            required: ['state_node_id', 'processor_node_id', 'direction'],
        },
        execute: async (params, store) => {
            const stateNode = store.getNode(params.state_node_id);
            const processorNode = store.getNode(params.processor_node_id);
            if (!stateNode) return { success: false, error: `State node ${params.state_node_id} not found` };
            if (!processorNode) return { success: false, error: `Processor node ${params.processor_node_id} not found` };

            // Validate types
            const stateLabel = stateNode.data?.config?.name || stateNode.data?.name || stateNode.data?.label || 'state';
            const procLabel = processorNode.data?.config?.name || processorNode.data?.name || processorNode.data?.label || processorNode.type;

            if (stateNode.type !== 'state') {
                return { success: false, error: `Node ${params.state_node_id} "${stateLabel}" is not a state (type: ${stateNode.type}). The state_node_id must reference a state node.` };
            }
            if (!processorNode.type?.startsWith('processor') && !processorNode.type?.startsWith('function')) {
                return { success: false, error: `Node ${params.processor_node_id} "${procLabel}" is not a processor (type: ${processorNode.type}). The processor_node_id must reference a processor node.` };
            }

            // INPUT: state → processor (state is source, processor is target)
            // OUTPUT: processor → state (processor is source, state is target)
            const source = params.direction === 'INPUT' ? params.state_node_id : params.processor_node_id;
            const target = params.direction === 'INPUT' ? params.processor_node_id : params.state_node_id;

            const sourceNode = store.getNode(source);
            const targetNode = store.getNode(target);
            const handles = pickHandles(sourceNode, targetNode);

            const connection = {
                source,
                target,
                sourceHandle: handles.sourceHandle,
                targetHandle: handles.targetHandle,
            };

            await store.createProcessorStateWithWorkflowEdge(connection);

            return {
                success: true,
                edge: {
                    state_node_id: params.state_node_id,
                    state_label: stateLabel,
                    processor_node_id: params.processor_node_id,
                    processor_label: procLabel,
                    direction: params.direction,
                },
            };
        },
    });

    // ─── Delete Edge ───────────────────────────────────────────────────
    registry.register({
        name: 'delete_edge',
        description: 'Remove a connection (edge) between two nodes.',
        category: 'workflow',
        confirm: true,
        parameters: {
            type: 'object',
            properties: {
                edge_id: { type: 'string', description: 'Edge ID (format: "sourceId:targetId")' },
            },
            required: ['edge_id'],
        },
        execute: async (params, store) => {
            const edge = store.findWorkflowEdgeById(params.edge_id);
            if (!edge) return { success: false, error: `Edge ${params.edge_id} not found` };

            await store.deleteProcessorStateWithWorkflowEdge(params.edge_id);
            return { success: true, deleted_edge_id: params.edge_id };
        },
    });

    // ─── Get Edges ─────────────────────────────────────────────────────
    registry.register({
        name: 'get_edges',
        description: 'List all edges (connections) in the current workflow.',
        category: 'workflow',
        confirm: false,
        parameters: { type: 'object', properties: {}, required: [] },
        execute: async (_params, store) => {
            const edges = store.workflowEdges || [];
            return {
                success: true,
                count: edges.length,
                edges: edges.map(e => ({
                    id: e.id,
                    source: e.source,
                    target: e.target,
                    source_handle: e.sourceHandle,
                    target_handle: e.targetHandle,
                    type: e.type,
                })),
            };
        },
    });

    // ─── Create Pipeline (compound) ─────────────────────────────────────
    registry.register({
        name: 'create_pipeline',
        description: 'Create a pipeline: input state → processor → output state(s). By default creates NEW input and output states. To reuse EXISTING states, pass existing_input_state_id and/or existing_output_state_ids — those states will be connected instead of creating new ones.',
        category: 'workflow',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                node_type: {
                    type: 'string',
                    enum: [
                        'processor_openai', 'processor_anthropic', 'processor_google',
                        'processor_googleai', 'processor_mistral', 'processor_llama',
                        'processor_python', 'processor_visual_openai',
                        'processor_state_coalescer', 'processor_state_composite',
                        'processor_provider', 'function_datasource_sql', 'function_user_interaction',
                    ],
                    description: 'The processor type to create',
                },
                processor_label: { type: 'string', description: 'Display label for the processor node' },
                input_label: { type: 'string', description: 'Display label for the NEW input state (ignored if existing_input_state_id is set)' },
                output_label: { type: 'string', description: 'Display label for the NEW output state (ignored if existing_output_state_ids is set)' },
                existing_input_state_id: { type: 'string', description: 'ID of an EXISTING state to use as input instead of creating a new one' },
                existing_output_state_ids: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of EXISTING state IDs to connect as outputs instead of creating a new one. The processor will output to ALL of these states.',
                },
                provider_id: { type: 'string', description: 'Explicit provider ID to assign (optional — auto-matched from node_type if omitted)' },
                user_template_id: { type: 'string', description: 'Template ID for user/instruction prompt on the output state (for LM processors)' },
                system_template_id: { type: 'string', description: 'Template ID for system prompt on the output state (optional, for LM processors)' },
            },
            required: ['node_type'],
        },
        execute: async (params, store) => {
            const projectId = store.selectedProjectId;
            if (!projectId) return { success: false, error: 'No project selected' };

            const errors = [];

            // ── 1. Input state: reuse existing or create new ──
            let inputId = params.existing_input_state_id || null;
            let inputLabel;
            if (inputId) {
                const existingInput = store.getNode(inputId);
                if (!existingInput) return { success: false, error: `Existing input state ${inputId} not found` };
                inputLabel = existingInput.data?.name || existingInput.data?.label || 'Input State';
            } else {
                const inputPos = autoLayout.getNextPosition({ existingNodes: store.workflowNodes || [], nodeType: 'state' });
                const inputNode = await store.createStateWithWorkflowNode({
                    node_type: 'state',
                    node_label: params.input_label || 'Input State',
                    project_id: projectId,
                    position_x: inputPos.x, position_y: inputPos.y,
                    width: 100, height: 100,
                });
                inputId = inputNode?.id;
                inputLabel = params.input_label || 'Input State';
                if (!inputId) return { success: false, error: 'Failed to create input state node' };

                // Set input state config name
                const inputData = store.getNodeData(inputId);
                const inputResp = await store.authPost('/state/create', {
                    id: inputId, state_type: 'StateConfig', project_id: projectId,
                    columns: inputData?.columns || {},
                    config: { ...(inputData?.config || {}), storage_class: 'database', name: inputLabel },
                });
                if (inputResp.ok) store.setNodeData(inputId, await inputResp.json());
            }

            // ── 2. Create processor ──
            const procPos = autoLayout.getNextPosition({ existingNodes: store.workflowNodes || [], nodeType: params.node_type });
            const procNode = await store.createProcessorWithWorkflowNode({
                node_type: params.node_type,
                node_label: params.processor_label || params.node_type,
                project_id: projectId,
                position_x: procPos.x, position_y: procPos.y,
                width: 100, height: 100,
            });
            const procId = procNode?.id;
            if (!procId) return { success: false, error: 'Failed to create processor node', input_state_id: inputId };

            // Auto-assign provider
            let assignedProvider = null;
            const providers = store.providers || [];
            let provider = params.provider_id
                ? providers.find(p => p.id === params.provider_id)
                : findProviderForNodeType(params.node_type, providers);

            if (provider) {
                const procData = store.getNodeData(procId) || {};
                const provResp = await store.authPost('/processor/create', {
                    id: procId, provider_id: provider.id,
                    status: procData.status || 'CREATED', project_id: projectId,
                    name: procData.name || '', class_name: provider.class_name,
                    properties: procData.properties || {},
                });
                if (provResp.ok) {
                    const updatedData = await provResp.json();
                    if (!updatedData.properties) updatedData.properties = {};
                    store.setNodeData(procId, updatedData);
                    assignedProvider = { id: provider.id, name: provider.name, class_name: provider.class_name };
                }
            }

            // ── 3. Output states: reuse existing or create new ──
            let outputIds = [];
            let outputLabels = [];
            if (params.existing_output_state_ids && params.existing_output_state_ids.length > 0) {
                for (const oid of params.existing_output_state_ids) {
                    const existingOutput = store.getNode(oid);
                    if (!existingOutput) {
                        errors.push(`Existing output state ${oid} not found, skipping`);
                        continue;
                    }
                    outputIds.push(oid);
                    outputLabels.push(existingOutput.data?.name || existingOutput.data?.label || 'Output State');
                }
                if (outputIds.length === 0) {
                    return { success: false, error: 'None of the existing output states were found', processor_id: procId };
                }
            } else {
                const outputPos = autoLayout.getNextPosition({ existingNodes: store.workflowNodes || [], nodeType: 'state' });
                const outputNode = await store.createStateWithWorkflowNode({
                    node_type: 'state',
                    node_label: params.output_label || 'Output State',
                    project_id: projectId,
                    position_x: outputPos.x, position_y: outputPos.y,
                    width: 100, height: 100,
                });
                const outputId = outputNode?.id;
                if (!outputId) return { success: false, error: 'Failed to create output state', input_state_id: inputId, processor_id: procId };
                outputIds.push(outputId);
                outputLabels.push(params.output_label || 'Output State');

                // Configure output state with appropriate StateConfig
                const className = assignedProvider?.class_name || NODE_TYPE_TO_CLASS_NAME[params.node_type];
                const stateConfigType = CLASS_NAME_TO_STATE_CONFIG[className] || 'StateConfig';
                const outputData = store.getNodeData(outputId);
                const outputConfig = {
                    ...(outputData?.config || {}),
                    storage_class: 'database',
                    name: params.output_label || 'Output State',
                };
                if (stateConfigType === 'StateConfigLM' && params.user_template_id) {
                    outputConfig.user_template_id = params.user_template_id;
                    if (params.system_template_id) outputConfig.system_template_id = params.system_template_id;
                }
                const outputResp = await store.authPost('/state/create', {
                    id: outputId, state_type: stateConfigType, project_id: projectId,
                    columns: outputData?.columns || {}, config: outputConfig,
                });
                if (outputResp.ok) store.setNodeData(outputId, await outputResp.json());
                else errors.push(`Failed to configure output state: ${outputResp.status}`);
            }

            // ── 4. Connect input → processor (INPUT edge) ──
            const inputSourceNode = store.getNode(inputId);
            const procTargetNode = store.getNode(procId);
            if (inputSourceNode && procTargetNode) {
                const handles1 = pickHandles(inputSourceNode, procTargetNode);
                await store.createProcessorStateWithWorkflowEdge({
                    source: inputId, target: procId,
                    sourceHandle: handles1.sourceHandle, targetHandle: handles1.targetHandle,
                });
            } else {
                errors.push('Could not create input edge — nodes not found');
            }

            // ── 5. Connect processor → each output state (OUTPUT edges) ──
            const procSourceNode = store.getNode(procId);
            for (const outputId of outputIds) {
                const outputTargetNode = store.getNode(outputId);
                if (procSourceNode && outputTargetNode) {
                    const handles2 = pickHandles(procSourceNode, outputTargetNode);
                    await store.createProcessorStateWithWorkflowEdge({
                        source: procId, target: outputId,
                        sourceHandle: handles2.sourceHandle, targetHandle: handles2.targetHandle,
                    });
                } else {
                    errors.push(`Could not create output edge to ${outputId}`);
                }
            }

            return {
                success: true,
                input_state_id: inputId,
                input_label: inputLabel,
                processor_id: procId,
                processor_type: params.node_type,
                processor_label: params.processor_label || params.node_type,
                output_state_ids: outputIds,
                output_labels: outputLabels,
                provider: assignedProvider,
                errors: errors.length > 0 ? errors : undefined,
            };
        },
    });
}

export default registerWorkflowTools;
