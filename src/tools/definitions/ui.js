import registry from '../registry.js';
import { FileTemplate } from '../../store/model';

/**
 * UI action tools — select nodes, fit view, switch workspace, navigate.
 */
export function registerUITools() {

    // ─── Select Node ───────────────────────────────────────────────────
    registry.register({
        name: 'select_node',
        description: 'Select a node on the canvas (highlights it and shows its properties in the sidebar).',
        category: 'ui',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                node_id: { type: 'string', description: 'ID of the node to select' },
            },
            required: ['node_id'],
        },
        execute: async (params, store) => {
            const node = store.getNode(params.node_id);
            if (!node) return { success: false, error: `Node ${params.node_id} not found` };

            store.setSelectedNodeId(params.node_id);
            return { success: true, selected_node_id: params.node_id, node_type: node.type };
        },
    });

    // ─── Switch to Bench ───────────────────────────────────────────────
    registry.register({
        name: 'switch_to_bench',
        description: 'Switch the center panel to the Bench (workflow canvas) workspace.',
        category: 'ui',
        confirm: false,
        parameters: { type: 'object', properties: {}, required: [] },
        execute: async (_params, store) => {
            store.setCurrentWorkspace('bench');
            return { success: true, workspace: 'bench' };
        },
    });

    // ─── Switch Workspace ──────────────────────────────────────────────
    registry.register({
        name: 'switch_workspace',
        description: 'Switch the center panel to a specific workspace (home, bench, editor).',
        category: 'ui',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                workspace: {
                    type: 'string',
                    enum: ['home', 'bench', 'editor'],
                    description: 'Workspace to switch to',
                },
            },
            required: ['workspace'],
        },
        execute: async (params, store) => {
            store.setCurrentWorkspace(params.workspace);
            return { success: true, workspace: params.workspace };
        },
    });
    // ─── Trigger File Upload ──────────────────────────────────────────
    registry.register({
        name: 'trigger_file_upload',
        description: 'Open the file upload dialog so the user can select a CSV or data file to upload to a state. This triggers the browser file picker.',
        category: 'ui',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                state_id: { type: 'string', description: 'State node ID to upload data into' },
            },
            required: ['state_id'],
        },
        execute: async (params, store) => {
            const node = store.getNode(params.state_id);
            if (!node) return { success: false, error: `State node ${params.state_id} not found` };

            // Ensure the bench is visible so the StateNodeComponent can pick up the trigger
            store.setCurrentWorkspace('bench');

            // Set a pending upload target — the StateNodeComponent picks this up and opens its upload dialog
            store.setPendingUploadStateId(params.state_id);

            return {
                success: true,
                state_id: params.state_id,
                message: 'File upload dialog opened on the state node. Please select a file.',
            };
        },
    });

    // ─── Group Nodes ─────────────────────────────────────────────────
    registry.register({
        name: 'group_nodes',
        description: 'Group multiple nodes together on the canvas. Grouped nodes are visually enclosed and can be collapsed. PREFERRED: Use match_label to match nodes by their label text (e.g. match_label="Output" groups all nodes with "Output" in their name). You can also use match_type to group by node type, or explicit node_ids as a last resort.',
        category: 'ui',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                node_ids: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of node IDs to group together (at least 2)',
                },
                group_name: { type: 'string', description: 'Display name for the group' },
                match_label: { type: 'string', description: 'Match nodes whose label contains this text (case-insensitive). Use instead of node_ids to group by name pattern.' },
                match_type: {
                    type: 'string',
                    enum: ['state', 'processor'],
                    description: 'Match all nodes of this type. Use instead of node_ids to group by type.',
                },
            },
            required: [],
        },
        execute: async (params, store) => {
            let nodeIds = params.node_ids || [];

            // Match by label pattern
            if ((!nodeIds || nodeIds.length === 0) && params.match_label) {
                const pattern = params.match_label.toLowerCase();
                const nodes = store.workflowNodes || [];
                nodeIds = nodes
                    .filter(n => {
                        const label = (n.data?.name || n.data?.label || '').toLowerCase();
                        return label.includes(pattern);
                    })
                    .map(n => n.id);
            }

            // Match by type
            if ((!nodeIds || nodeIds.length === 0) && params.match_type) {
                const nodes = store.workflowNodes || [];
                nodeIds = nodes
                    .filter(n => {
                        if (params.match_type === 'state') return n.type === 'state';
                        if (params.match_type === 'processor') return n.type?.startsWith('processor') || n.type?.startsWith('function');
                        return false;
                    })
                    .map(n => n.id);
            }

            if (!nodeIds || nodeIds.length < 2) {
                return { success: false, error: `Need at least 2 nodes to create a group. Found ${nodeIds?.length || 0}.` };
            }

            // Verify all nodes exist
            const missing = nodeIds.filter(id => !store.getNode(id));
            if (missing.length > 0) {
                return { success: false, error: `Nodes not found: ${missing.join(', ')}` };
            }

            const groupId = store.createGroup(nodeIds, params.group_name || 'Group');
            if (!groupId) {
                return { success: false, error: 'Failed to create group' };
            }

            return {
                success: true,
                group_id: groupId,
                group_name: params.group_name || 'Group',
                node_count: nodeIds.length,
                node_ids: nodeIds,
            };
        },
    });

    // ─── Ungroup Nodes ───────────────────────────────────────────────
    registry.register({
        name: 'ungroup_nodes',
        description: 'Remove a group, ungrouping all its member nodes.',
        category: 'ui',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                group_name: { type: 'string', description: 'Name of the group to delete. Matches the first group whose name contains this text.' },
            },
            required: ['group_name'],
        },
        execute: async (params, store) => {
            const pattern = params.group_name.toLowerCase();
            const groupDefs = store.groupDefinitions || {};
            const match = Object.entries(groupDefs).find(([, def]) =>
                def.name?.toLowerCase().includes(pattern)
            );
            if (!match) return { success: false, error: `No group matching "${params.group_name}" found` };

            const [groupId, def] = match;
            store.deleteGroup(groupId);
            return { success: true, deleted_group: def.name };
        },
    });

    // ─── Rename Group ────────────────────────────────────────────────
    registry.register({
        name: 'rename_group',
        description: 'Rename an existing node group.',
        category: 'ui',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                current_name: { type: 'string', description: 'Current group name (partial match)' },
                new_name: { type: 'string', description: 'New name for the group' },
            },
            required: ['current_name', 'new_name'],
        },
        execute: async (params, store) => {
            const pattern = params.current_name.toLowerCase();
            const groupDefs = store.groupDefinitions || {};
            const match = Object.entries(groupDefs).find(([, def]) =>
                def.name?.toLowerCase().includes(pattern)
            );
            if (!match) return { success: false, error: `No group matching "${params.current_name}" found` };

            const [groupId] = match;
            store.renameGroup(groupId, params.new_name);
            return { success: true, group_name: params.new_name };
        },
    });

    // ─── Open in Editor ─────────────────────────────────────────────
    registry.register({
        name: 'open_in_editor',
        description: 'Open a template file in the code editor tab. Use this when the user wants to view or edit a mako template, python script, SQL query, or any other template file.',
        category: 'ui',
        confirm: false,
        parameters: {
            type: 'object',
            properties: {
                template_id: { type: 'string', description: 'ID of the template to open in the editor' },
            },
            required: ['template_id'],
        },
        execute: async (params, store) => {
            const template = store.getTemplate(params.template_id);
            if (!template) {
                return { success: false, error: `Template ${params.template_id} not found` };
            }

            const fileTemplate = new FileTemplate(template);
            store.setSelectedFile(fileTemplate);
            store.setCurrentWorkspace('editor');

            return {
                success: true,
                template_id: params.template_id,
                template_name: template.template_path || template.template_id,
                template_type: template.template_type,
                message: `Opened "${template.template_path}" in the editor.`,
            };
        },
    });
}

export default registerUITools;
