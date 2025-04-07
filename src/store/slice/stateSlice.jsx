export const useStateSlice = (set, get) => ({

    deleteNodeDataStateConfigKeyDefinition: async (nodeId, definition_type, id) => {
        try {
            const response = await fetch(`${get().ISM_API_BASE_URL}/state/${nodeId}/config/${definition_type}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                // TODO proper error handling -- throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error(`Failed to delete state node configuration definition key ${definition_type} with id ${id}: `, error);
        }
    },

    getNodeDataStateConfigKeyDefinition: (nodeId, definition_name) => {
        const config = get().getNodeDataStateConfig(nodeId)
        if (!config) {
            return null
        }
        return config[definition_name]
    },

    getNodeDataStateConfigActions: (nodeId) => {
        const config = get().getNodeDataStateConfig(nodeId)
        if (!config) {
            return null
        }
        return config["actions"]
    },

    purgeStateData: async (stateId) => {
        if (!stateId) {
            return
        }

        const response = await fetch(`${get().ISM_API_BASE_URL}/state/${stateId}/data`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            // TODO proper error handling -- throw new Error('Network response was not ok');
        }
    },

    // State Object Updates, Deletes, ...
    deleteState: async (stateId) => {
        if (!stateId) {
            return {}
        }

        const response = await fetch(`${get().ISM_API_BASE_URL}/state/${stateId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${get().jwtToken}`,
            }
        });

        if (!response.ok) {
            // TODO proper error handling -- throw new Error('Network response was not ok');
            return {}
        }

        // TODO delete the exact nodes and edges instead of doing a full refresh.
        const projectId = get().selectedProjectId
        await get().fetchWorkflowNodes(projectId);
        await get().fetchWorkflowEdges(projectId);
    },

    fetchState: async (stateId, load_state = false, setNodeData = true, offset = 0, limit = 100) => {
        if (!stateId) {
            return
        }

        try {
            const response = await fetch(`${get().ISM_API_BASE_URL}/state/${stateId}?load_data=${load_state}&offset=${offset}&limit=${limit}`)
            let stateData = {
                id: stateId
            }

            if (response.ok) {
                stateData = await response.json();
            }

            // return quickly if state data is not found
            if (setNodeData) {
                get().setNodeData(stateId, stateData)
            }

            return stateData
        } catch (error) {
            console.warn(`Warning, unable to fetch data for state id: ${stateId} with error`, error);
        }
    },

    createState: async (nodeId) => {
        if (!nodeId) {
            console.log('warning: no node data found')
        }

        const node = get().getNode(nodeId)
        let stateData = get().getNodeData(nodeId)
        const stateObject =
            {
                "id": node.id,
                "state_type": stateData.state_type || 'StateConfig',
                "project_id": get().selectedProjectId,
                "columns": stateData.columns || {},
                "config": {
                    ...stateData.config, // append existing nodeData.config to the new object
                    "storage_class": "database",
                }
            }

        const response = await fetch(`${get().ISM_API_BASE_URL}/state/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(stateObject),
        });

        if (!response.ok) {
            // TODO proper error handling -- throw new Error('Network response was not ok');
        }

        // reassign the new state data returned, this will provide an updated list of ids if any
        stateData = await response.json();
        get().setNodeData(nodeId, stateData)
        return stateData
    },

    uploadState: async (stateId, file) => {
        if (!stateId) {
            // TODO proper error handling -- throw new Error('warning: no state id specified')
        }

        // const node = get().getNode(nodeId);
        // const nodeData = get().getNodeData(nodeId);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(`${get().ISM_API_BASE_URL}/state/${stateId}/data/upload`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data);
            } else {
                // TODO proper error handling -- throw new Error("Upload of state dataset failed");
            }
        } catch (error) {
            console.error(error);
        }
    },


    deleteProcessorStateWithWorkflowEdge: async(id) => {
        return await get().deleteWorkflowEdge(id).then(() => {
            get().deleteProcessorState(id).then(() => {
                const {workflowEdges} = get(); // Get the current state of workflowNodes
                const updatedEdges = workflowEdges.filter(edge => edge.id !== id);

                set((state) => ({
                    workflowEdges: updatedEdges,
                }));
            })
        })
    },

    getNodeDataStateConfig: (nodeId) => {
        const node = get().getNode(nodeId)
        if (!node) {
            console.error(`no node found by id ${nodeId}`)
            return null
        }

        const nodeData = get().getNodeData(nodeId)

        //
        if (!nodeData?.config) {
            nodeData.config = {
                name: node?.node_label,
                primary_key: [],
                query_state_inheritance: [],
                remap_query_state_columns: [],
                template_columns: [],
            }
        }

        return nodeData.config
    },

    getNodeDataColumns: (nodeId) => {
        const nodeData = get().getNodeData(nodeId)

        if (!nodeData?.columns) {
            return []
        }

        return get().mapToArray(nodeData.columns)
    },

    setNodeDataColumns: (nodeId, columnsArray) => {
        const state = get().getNodeData(nodeId)
        state.columns = get().arrayToMap(columnsArray)
        get().setNodeData(nodeId, state)
    },

    // TODO might be obsolete, its a way to send data directly to the api to push data into a state
    publishQueryState: async(stateId, queryState) => {
        const response = await fetch(`${get().ISM_API_BASE_URL}/state/${stateId}/forward/entry`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            // body: JSON.stringify(queryState),
            body: JSON.stringify(queryState),
        });

        if (!response.ok) {
            // TODO proper error handling -- throw new Error('Network response error when trying to submit test query state for routing');
        }
    },

});

export default useStateSlice

