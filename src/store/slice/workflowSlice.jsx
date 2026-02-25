// Helper: extract group ID from metadata.group (supports both string and object shapes)
const getGroupId = (node) => {
    const g = node?.data?.metadata?.group;
    if (!g) return null;
    if (typeof g === 'string') return g;     // legacy: plain string
    return g.id || null;                      // new: { id, name, color, collapsed }
};

// Helper: extract full group object from metadata.group
const getGroupInfo = (node) => {
    const g = node?.data?.metadata?.group;
    if (!g) return null;
    if (typeof g === 'string') return { id: g }; // legacy
    return g;
};

export const useWorkflowSlice = (set, get) => ({
    selectedNodeId: null,
    setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),

    selectedEdgeId: null,
    setSelectedEdgeId: (selectedEdgeId) => set({ selectedEdgeId: selectedEdgeId }),

    // workflow -> edges
    workflowEdges: [],

    // collapsed nodes state - stores which nodes are collapsed (for hiding descendants)
    collapsedNodes: {},

    // visual collapsed state - stores which nodes are visually minimized
    nodeVisualState: {},

    // Set visual collapsed state for a node and persist to backend
    setNodeVisualCollapsed: async (nodeId, isCollapsed) => {
        if (!nodeId) return;

        // Update local state immediately
        set((state) => ({
            nodeVisualState: {
                ...state.nodeVisualState,
                [nodeId]: { ...state.nodeVisualState[nodeId], collapsed: isCollapsed }
            }
        }));

        // Persist to backend
        try {
            const node = get().getNode(nodeId);
            if (node) {
                const currentMetadata = node.data?.metadata || {};
                const updatedMetadata = { ...currentMetadata, collapsed: isCollapsed };

                const updatedNode = {
                    node_id: nodeId,
                    node_type: node.type,
                    node_label: node.data?.label,
                    project_id: get().selectedProjectId,
                    object_id: node.data?.objectId,
                    position_x: node.position.x,
                    position_y: node.position.y,
                    width: node.data?.width,
                    height: node.data?.height,
                    metadata: updatedMetadata
                };

                await get().authPost('/workflow/node/create', updatedNode);

                // Update local node data with new metadata
                get().setNodeData(nodeId, { metadata: updatedMetadata });
            }
        } catch (error) {
            console.error('Failed to persist collapsed state:', error);
        }
    },

    // Get visual collapsed state for a node
    isNodeVisuallyCollapsed: (nodeId) => {
        if (!nodeId) return false;
        return get().nodeVisualState[nodeId]?.collapsed || false;
    },

    workflowNodes: [],
    fetchWorkflowNodes: async (projectId) => {
        try {
            // Reset all node + group state for clean load
            set({ workflowNodes: [], nodeVisualState: {}, groupDefinitions: {}, collapsedGroups: {} });

            const response = await get().authGet(`/project/${projectId}/workflow/nodes`);
            const nodes = await response.json();

            // Build visual state from node metadata
            const visualState = {};
            nodes.forEach(node => {
                if (node.metadata?.collapsed !== undefined) {
                    visualState[node.node_id] = { collapsed: node.metadata.collapsed };
                }
            });

            // remap the api data structure to the internal reactflow data structure
            const updatedNodes = nodes.map(node => ({
                id: node.node_id,
                type: node.node_type,
                position: {
                    x: node.position_x,
                    y: node.position_y
                },
                data: {
                    id: node.node_id,
                    metadata: node.metadata || {}
                    // width: node.width,
                    // height: node.height,
                }
            }));

            // Hydrate group definitions from node metadata.group objects.
            // Iterate all nodes — each subsequent member with non-null fields
            // overrides the previous (last member with data wins).
            const discoveredGroups = {};
            const discoveredCollapsed = {};
            const defaultColors = ['#6366f1', '#f59e0b', '#ec4899', '#14b8a6', '#8b5cf6', '#ef4444', '#06b6d4'];
            let colorIdx = 0;
            updatedNodes.forEach(node => {
                const info = getGroupInfo(node);
                if (!info?.id) return;
                const gid = info.id;

                if (!discoveredGroups[gid]) {
                    // First node for this group — seed with defaults
                    discoveredGroups[gid] = {
                        name: gid.replace(/^group-\d+-/, 'Group '),
                        color: defaultColors[colorIdx % defaultColors.length],
                    };
                    discoveredCollapsed[gid] = true;
                    colorIdx++;
                }

                // Override with non-null values from this member
                if (info.name) discoveredGroups[gid].name = info.name;
                if (info.color) discoveredGroups[gid].color = info.color;
                if (info.collapsed !== undefined && info.collapsed !== null) {
                    discoveredCollapsed[gid] = info.collapsed;
                }
            });

            set({
                workflowNodes: updatedNodes,
                nodeVisualState: visualState,
                groupDefinitions: discoveredGroups,
                collapsedGroups: discoveredCollapsed,
            });
        } catch (error) {
            console.error('Failed to fetch  nodes:', error);
        }
    },

    // Use .find() to search for the node with the matching ID
    getNode: (nodeId) => {
        const { workflowNodes } = get(); // Get the current state of workflowNodes
        if (!workflowNodes || !nodeId) {
            return null
        }
        return workflowNodes.find(node => node.id === nodeId) || null; // This will be the node if found, or null if not
    },

    // Use .find() to search for the node with the matching ID
    getNodeData: (nodeId) => {
        return get().getNode(nodeId)?.data
    },

    setWorkflowEdges: (edges) => set({ workflowEdges: edges }),

    createNewEdge: async (edge) => {
        const response = await get().authPost('/workflow/edge/create', edge);

        if (!response.ok) {
            // TODO proper error handling -- throw new Error('Network response was not ok');
        }

        const newEdge = await response.json();

        const updatedEdge = {
            id: newEdge.source_node_id + ":" + newEdge.target_node_id,
            source: newEdge.source_node_id,
            target: newEdge.target_node_id,
            sourceHandle: newEdge.source_handle,
            targetHandle: newEdge.target_handle,
            type: newEdge.type,
            // edge_label: newEdge
            animated: false, // or based on the response if your API specifies this
        };

        // Update the local Zustand store
        set((state) => ({
            workflowEdges: [...state.workflowEdges, updatedEdge],
        }));

        return updatedEdge
    },

    // Function to update a node's data by ID
    setNodeData: (nodeId, newData) => {
        set(store => ({
            // iterate each workflow node within the store
            workflowNodes: store.workflowNodes.map(node => {
                    // if the node id ! does not match then return immediate
                    if (node.id !== nodeId) {
                        return node
                    }

                    // otherwise update the node data by appending to it
                    return { ...node,
                        data: {
                            ...node.data, ...newData
                        }
                    }
                }
            )
        }));
    },

    deleteNode: async (nodeId) => {
        try {
            const response = await get().authDelete(`/workflow/node/${nodeId}/delete`);

            if (!response.ok) {
                // TODO proper error handling -- throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Failed to delete node:', error);
        }
    },

    updateNode: async (nodeId) => {
        try {
            const node = get().getNode(nodeId);
            const visualState = get().nodeVisualState[nodeId];

            // Merge visual state into metadata
            const metadata = {
                ...(node.data?.metadata || {}),
                ...(visualState?.collapsed !== undefined ? { collapsed: visualState.collapsed } : {})
            };

            const updatedNode = {
                node_id: nodeId,
                node_type: node.type,
                node_label: node.data?.label,
                project_id: get().selectedProjectId,
                object_id: node.data?.objectId,
                position_x: node.position.x,
                position_y: node.position.y,
                width: node.data?.width,
                height: node.data?.height,
                metadata: Object.keys(metadata).length > 0 ? metadata : null
            };

            const response = await get().authPost('/workflow/node/create', updatedNode);

            if (!response.ok) {
                // TODO proper error handling -- throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Failed to create new node:', error);
        }
    },

    createNewNode: async (newNode) => {
        try {
            // Assuming `newNode` is an object that matches the backend's expected request body
            const response = await get().authPost('/workflow/node/create', newNode);

            if (!response.ok) {
                // TODO proper error handling -- throw new Error('Network response was not ok');
            }

            const createdNode = await response.json();

            // Assuming the response contains the full node data in the expected format
            const updatedNode = {
                // this is primarily used for the workflow nodes, it holds general inforamtion about a node, but not its internal data structure
                id: createdNode.node_id,
                type: createdNode.node_type,
                position: {
                    x: createdNode.position_x,
                    y: createdNode.position_y
                },
                data: {
                    name: createdNode.node_label,
                    width: createdNode.width,
                    height: createdNode.height,
                    // additional fields are added depending on what type of node type this is
                    // for example, in a state node, a config: {} attribute is added with relevant fields
                }
            };

            // setWorkflowNodes([...workflowNodes, newNode])

            // Get the current state of workflowNodes and append the new node
            set((state) => ({
                workflowNodes: [...state.workflowNodes, updatedNode],
            }));

            return updatedNode
        } catch (error) {
            console.error('Failed to create new node:', error);
        }
    },

    setWorkflowNodes: (nodes) => set({ workflowNodes: nodes }),

    fetchWorkflowEdges: async (projectId) => {
        try {
            set({ workflowEdges: []});

            const response = await get().authGet(`/project/${projectId}/workflow/edges`);
            const edges = await response.json();

            // remap the api data structure to the internal reactflow data structure
            const updatedEdges = edges.map(edge => ({
                // ...node, // Spread the original node properties
                id: edge.source_node_id + ":" + edge.target_node_id,
                source: edge.source_node_id,
                target: edge.target_node_id,
                sourceHandle: edge.source_handle,
                targetHandle: edge.target_handle,
                type: edge.type,
                animated: false
            }));

            set({ workflowEdges: updatedEdges });
        } catch (error) {
            console.error('Failed to fetch  edges:', error);
        }
    },

    findWorkflowEdgeById: (edgeId) => {
        const { workflowEdges } = get(); // Get the current state of workflowNodes
        return workflowEdges.find(edge => edge.id === edgeId);
    },

    deleteWorkflowEdge: async (edgeId) => {
        try {
            const edge = get().findWorkflowEdgeById(edgeId)

            const response = await get().authDelete('/workflow/edge', {
                source_node_id: edge.source,
                target_node_id: edge.target
            });

            if (!response.ok) {
                // TODO proper error handling -- throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Failed to delete node:', error);
        }
    },

    // Toggle collapse state for a node
    toggleNodeCollapse: (nodeId) => {
        if (!nodeId) return;

        set((state) => ({
            collapsedNodes: {
                ...state.collapsedNodes,
                [nodeId]: !state.collapsedNodes[nodeId]
            }
        }));
    },

    // Check if a node is collapsed
    isNodeCollapsed: (nodeId) => {
        if (!nodeId) return false;
        return get().collapsedNodes[nodeId] || false;
    },

    // Check if a node has children (outgoing edges)
    nodeHasChildren: (nodeId) => {
        if (!nodeId) return false;
        const { workflowEdges } = get();
        return workflowEdges.some(e => e.source === nodeId);
    },

    // Get all descendant nodes that should be hidden when a node is collapsed
    getDescendantNodes: (nodeId) => {
        if (!nodeId) return [];

        const { workflowEdges } = get();
        const descendants = new Set();
        const visited = new Set([nodeId]);
        const queue = [];

        // Find direct children of the collapse point
        workflowEdges.forEach(edge => {
            if (edge.source === nodeId && edge.target !== nodeId) {
                descendants.add(edge.target);
                queue.push(edge.target);
            }
        });

        // BFS traversal to find all nodes in the forward graph
        while (queue.length > 0) {
            const currentNodeId = queue.shift();

            if (visited.has(currentNodeId)) continue;
            visited.add(currentNodeId);

            // Process all edges connected to current node
            workflowEdges.forEach(edge => {
                // Outgoing edges: add targets to descendants
                if (edge.source === currentNodeId &&
                    edge.target !== nodeId &&
                    !descendants.has(edge.target)) {
                    descendants.add(edge.target);
                    if (!visited.has(edge.target)) {
                        queue.push(edge.target);
                    }
                }

                // Incoming edges: if current node is a descendant,
                // its sources should also be hidden (except the original node)
                if (edge.target === currentNodeId &&
                    edge.source !== nodeId &&
                    descendants.has(currentNodeId) &&
                    !descendants.has(edge.source)) {
                    descendants.add(edge.source);
                    if (!visited.has(edge.source)) {
                        queue.push(edge.source);
                    }
                }
            });
        }

        return Array.from(descendants);
    },

    // Get visible nodes and edges based on collapse state
    getVisibleNodesAndEdges: () => {
        const { workflowNodes, workflowEdges, collapsedNodes } = get();
        const hiddenNodes = new Set();

        // Collect all hidden nodes from collapsed parents
        Object.entries(collapsedNodes).forEach(([nodeId, isCollapsed]) => {
            if (isCollapsed) {
                const descendants = get().getDescendantNodes(nodeId);
                descendants.forEach(id => hiddenNodes.add(id));
            }
        });

        const visibleNodes = workflowNodes.filter(node => !hiddenNodes.has(node.id));

        // ReactFlow automatically hides edges when nodes are hidden
        return { visibleNodes, visibleEdges: workflowEdges };
    },

    // ==================== Node Clustering / Grouping ====================
    //
    // metadata.group shape (persisted on each member node):
    //   { id: string, name: string, color: string, collapsed: boolean }
    //
    // Legacy nodes may still have a plain string — the getGroupId/getGroupInfo
    // helpers at the top of this file handle both shapes transparently.

    // State: which groups are collapsed (groupId -> bool)
    collapsedGroups: {},
    // State: group definitions (groupId -> { name, color })
    groupDefinitions: {},

    // Build the metadata.group object for a given group
    _buildGroupMeta: (groupId) => {
        const def = get().groupDefinitions[groupId];
        const collapsed = get().collapsedGroups[groupId] ?? true;
        return {
            id: groupId,
            name: def?.name || 'Group',
            color: def?.color || '#6366f1',
            collapsed,
        };
    },

    // Create a group from selected node IDs
    createGroup: (nodeIds, groupName) => {
        if (!nodeIds || nodeIds.length < 2) return null;

        // Verify all nodes exist
        const validIds = nodeIds.filter(id => !!get().getNode(id));
        if (validIds.length < 2) return null;

        const groupId = crypto.randomUUID().slice(0, 8);
        const defaultColors = ['#6366f1', '#f59e0b', '#ec4899', '#14b8a6', '#8b5cf6', '#ef4444', '#06b6d4'];
        const color = defaultColors[Object.keys(get().groupDefinitions).length % defaultColors.length];

        // Track which old groups may become empty after we reassign nodes
        const oldGroupIds = new Set();
        validIds.forEach(nodeId => {
            const gid = getGroupId(get().getNode(nodeId));
            if (gid) oldGroupIds.add(gid);
        });

        // Add group definition and auto-collapse first (so _buildGroupMeta works)
        set((state) => ({
            groupDefinitions: {
                ...state.groupDefinitions,
                [groupId]: { name: groupName || `Group ${Object.keys(state.groupDefinitions).length + 1}`, color },
            },
            collapsedGroups: {
                ...state.collapsedGroups,
                [groupId]: true,
            },
        }));

        // Build the full group object to store on each node
        const groupMeta = get()._buildGroupMeta(groupId);

        // Set metadata.group on each member node
        validIds.forEach(nodeId => {
            const node = get().getNode(nodeId);
            if (node) {
                const updatedMetadata = { ...(node.data?.metadata || {}), group: groupMeta };
                get().setNodeData(nodeId, { metadata: updatedMetadata });
            }
        });

        // Clear selection on all grouped nodes so the next group doesn't inherit them
        set(store => ({
            workflowNodes: store.workflowNodes.map(node =>
                validIds.includes(node.id)
                    ? { ...node, selected: false }
                    : node
            ),
        }));

        // Clean up old groups that are now empty
        oldGroupIds.forEach(oldId => {
            const remaining = get().workflowNodes.filter(
                n => getGroupId(n) === oldId
            );
            if (remaining.length === 0) {
                set((state) => {
                    const { [oldId]: _def, ...restDefs } = state.groupDefinitions;
                    const { [oldId]: _col, ...restCollapsed } = state.collapsedGroups;
                    return { groupDefinitions: restDefs, collapsedGroups: restCollapsed };
                });
            }
        });

        // Persist metadata to backend for each node
        validIds.forEach(nodeId => get().updateNode(nodeId));

        return groupId;
    },

    // Delete a group, clearing metadata.group from all members
    deleteGroup: (groupId) => {
        if (!groupId) return;
        const { workflowNodes } = get();

        // Clear group from all member nodes
        workflowNodes.forEach(node => {
            if (getGroupId(node) === groupId) {
                const updatedMetadata = { ...(node.data.metadata) };
                delete updatedMetadata.group;
                get().setNodeData(node.id, { metadata: updatedMetadata });
                get().updateNode(node.id);
            }
        });

        // Remove group definition and collapsed state
        set((state) => {
            const { [groupId]: _def, ...restDefs } = state.groupDefinitions;
            const { [groupId]: _col, ...restCollapsed } = state.collapsedGroups;
            return { groupDefinitions: restDefs, collapsedGroups: restCollapsed };
        });
    },

    // Rename a group and persist to member nodes
    renameGroup: (groupId, newName) => {
        if (!groupId || !newName) return;
        set((state) => ({
            groupDefinitions: {
                ...state.groupDefinitions,
                [groupId]: { ...state.groupDefinitions[groupId], name: newName },
            },
        }));
        // Persist to all member node metadata
        const groupMeta = get()._buildGroupMeta(groupId);
        get().workflowNodes.forEach(node => {
            if (getGroupId(node) === groupId) {
                const updatedMetadata = { ...(node.data?.metadata || {}), group: groupMeta };
                get().setNodeData(node.id, { metadata: updatedMetadata });
                get().updateNode(node.id);
            }
        });
    },

    // Toggle group collapse and persist to member nodes
    toggleGroupCollapse: (groupId) => {
        if (!groupId) return;
        const newCollapsed = !get().collapsedGroups[groupId];
        set((state) => ({
            collapsedGroups: {
                ...state.collapsedGroups,
                [groupId]: newCollapsed,
            },
        }));

        // Persist collapsed state to all member node metadata
        const groupMeta = get()._buildGroupMeta(groupId);
        get().workflowNodes.forEach(node => {
            if (getGroupId(node) === groupId) {
                const updatedMetadata = { ...(node.data?.metadata || {}), group: groupMeta };
                get().setNodeData(node.id, { metadata: updatedMetadata });
                get().updateNode(node.id);
            }
        });
    },

    // Explicitly set group collapsed state
    setGroupCollapsed: (groupId, isCollapsed) => {
        if (!groupId) return;
        set((state) => ({
            collapsedGroups: {
                ...state.collapsedGroups,
                [groupId]: isCollapsed,
            },
        }));
    },

    // Assign a single node to a group
    assignNodeToGroup: (nodeId, groupId) => {
        if (!nodeId || !groupId) return;
        const node = get().getNode(nodeId);
        if (!node) return;
        const groupMeta = get()._buildGroupMeta(groupId);
        const updatedMetadata = { ...(node.data?.metadata || {}), group: groupMeta };
        get().setNodeData(nodeId, { metadata: updatedMetadata });
        get().updateNode(nodeId);
    },

    // Remove a node from its group, auto-delete empty groups
    removeNodeFromGroup: (nodeId) => {
        if (!nodeId) return;
        const node = get().getNode(nodeId);
        const groupId = getGroupId(node);
        if (!groupId) return;

        const updatedMetadata = { ...(node.data.metadata) };
        delete updatedMetadata.group;
        get().setNodeData(nodeId, { metadata: updatedMetadata });
        get().updateNode(nodeId);

        // Check if group is now empty
        const { workflowNodes } = get();
        const remaining = workflowNodes.filter(
            n => n.id !== nodeId && getGroupId(n) === groupId
        );
        if (remaining.length === 0) {
            // Auto-delete empty group
            set((state) => {
                const { [groupId]: _def, ...restDefs } = state.groupDefinitions;
                const { [groupId]: _col, ...restCollapsed } = state.collapsedGroups;
                return { groupDefinitions: restDefs, collapsedGroups: restCollapsed };
            });
        }
    },

    // Get member node IDs for a group
    getGroupMembers: (groupId) => {
        if (!groupId) return [];
        const { workflowNodes } = get();
        return workflowNodes
            .filter(n => getGroupId(n) === groupId)
            .map(n => n.id);
    },

});

export default useWorkflowSlice
