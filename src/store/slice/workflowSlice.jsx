export const createWorkflowSlice = (set, get) => ({
    selectedNode: null,
    setSelectedNode: (node) => set({ selectedNode: node }),

    selectedEdgeId: null,
    setSelectedEdgeId: (selectedEdgeId) => set({ selectedEdgeId: selectedEdgeId }),

    // workflow -> edges
    workflowEdges: [],

    workflowNodes: [],
    fetchWorkflowNodes: async (projectId) => {
        try {
            set({ workflowNodes: []});

            const response = await fetch(`${get().ISM_API_BASE_URL}/project/${projectId}/workflow/nodes`);
            const nodes = await response.json();

            // remap the api data structure to the internal reactflow data structure
            const updatedNodes = nodes.map(node => ({
                id: node.node_id,
                type: node.node_type,
                position: {
                    x: node.position_x,
                    y: node.position_y
                },
                data: {
                    id: node.node_id
                    // width: node.width,
                    // height: node.height,
                }
            }));

            set({ workflowNodes: updatedNodes });
        } catch (error) {
            console.error('Failed to fetch  nodes:', error);
        }
    },

    // Use .find() to search for the node with the matching ID
    getNode: (nodeId) => {
        const { workflowNodes } = get(); // Get the current state of workflowNodes
        return workflowNodes.find(node => node.id === nodeId); // This will be the node map if found, or undefined if not
    },

    // Use .find() to search for the node with the matching ID
    getNodeData: (nodeId) => {
        return get().getNode(nodeId)?.data
    },

    setWorkflowEdges: (edges) => set({ workflowEdges: edges }),

    createNewEdge: async (edge) => {
        const response = await fetch(`${get().ISM_API_BASE_URL}/workflow/edge/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(edge),
        });

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
            const response = await fetch(`${get().ISM_API_BASE_URL}/workflow/node/${nodeId}/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                // TODO proper error handling -- throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Failed to delete node:', error);
        }
    },

    updateNode: async (nodeId) => {
        try {
            const node = get().getNode(nodeId)

            const updatedNode = {
                node_id: nodeId,
                node_type: node.type,
                node_label: node.data.label,
                project_id: get().selectedProjectId,
                object_id: node.data.objectId,
                position_x: node.position.x,
                position_y: node.position.y,
                width: node.data.width,
                height: node.data.height,
            };

            const response = await fetch(`${get().ISM_API_BASE_URL}/workflow/node/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedNode),
            });

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
            const response = await fetch(`${get().ISM_API_BASE_URL}/workflow/node/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newNode),
            });

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

            const response = await fetch(`${get().ISM_API_BASE_URL}/project/${projectId}/workflow/edges`);
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

            const response = await fetch(`${get().ISM_API_BASE_URL}/workflow/edge`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    source_node_id: edge.source,
                    target_node_id: edge.target
                }),
            });

            if (!response.ok) {
                // TODO proper error handling -- throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Failed to delete node:', error);
        }
    },

});

export default createWorkflowSlice

