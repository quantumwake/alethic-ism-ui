export const useStateSlice = (set, get) => ({

    /**
     * Persist a state object to the backend and update the local node data.
     * This is the canonical mutation point — all state saves (from tools,
     * UI, or slice helpers) should go through here.
     *
     * @param {object} stateObject — full state payload (id, state_type, project_id, columns, config)
     * @returns {object|null} saved state data, or null on failure
     */
    saveState: async (stateObject) => {
        try {
            const response = await get().authPost('/state/create', stateObject);
            if (!response.ok) {
                console.error('Failed to save state:', response.status);
                return null;
            }
            const data = await response.json();
            get().setNodeData(stateObject.id, data);

            // Embed the mutation (fire-and-forget)
            get().afterMutation?.('state', 'update', data);

            return data;
        } catch (error) {
            console.error('Failed to save state:', error);
            return null;
        }
    },

    /**
     * Convenience: fetch current state data, merge overrides, and save.
     * Handles the common pattern of "read current → merge → persist" so
     * callers only specify what's changing.
     *
     * @param {string} stateId
     * @param {object} overrides — { state_type?, columns?, config? }
     *   - state_type: explicit type, falls back to current → 'StateConfig'
     *   - columns: replaces columns entirely if provided, else keeps current
     *   - config: shallow-merged on top of current config (storage_class always set)
     * @returns {object|null} saved state data, or null on failure
     */
    updateStateConfig: async (stateId, overrides = {}) => {
        const projectId = get().selectedProjectId;
        if (!projectId) return null;

        const currentData = get().getNodeData(stateId);
        const stateType = overrides.state_type || currentData?.state_type || 'StateConfig';
        const columns = overrides.columns || currentData?.columns || {};

        return await get().saveState({
            id: stateId,
            state_type: stateType,
            project_id: projectId,
            columns,
            properties: overrides.properties || currentData?.properties || null,
            config: {
                ...(currentData?.config || {}),
                storage_class: 'database',
                ...(overrides.config || {}),
            },
        });
    },

    deleteNodeDataStateConfigKeyDefinition: async (nodeId, definition_type, id) => {
        try {
            const response = await get().authDelete(`/state/${nodeId}/config/${definition_type}/${id}`);

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

        const response = await get().authDelete(`/state/${stateId}/data`);

        if (!response.ok) {
            // TODO proper error handling -- throw new Error('Network response was not ok');
        }
    },

    // State Object Updates, Deletes, ...
    deleteState: async (stateId) => {
        if (!stateId) {
            return {}
        }

        const response = await get().authDelete(`/state/${stateId}`);

        if (!response.ok) {
            // TODO proper error handling -- throw new Error('Network response was not ok');
            return {}
        }

        // Remove the embedding (fire-and-forget)
        get().afterMutation?.('state', 'delete', { state_id: stateId });

        // TODO delete the exact nodes and edges instead of doing a full refresh.
        const projectId = get().selectedProjectId
        await get().fetchWorkflowNodes(projectId);
        await get().fetchWorkflowEdges(projectId);
    },

    fetchState: async(stateId, load_state = false, setNodeData = true, offset = 0, limit = 100) => {
        if (!stateId) return

        // attempt to fetch the state defaults
        const response = await get().authGet(`/state/${stateId}?load_data=${load_state}&offset=${offset}&limit=${limit}`)
        if (!response?.ok) {
            get().setNodeData(stateId, {id: stateId})
            return
        }

        const stateData = await response.json()
        get().setNodeData(stateId, stateData)
        return stateData
    },

    fetchStatesByProject: async (projectId) => {
        const resp = await get().authGet(`/project/${projectId}/states`)
        if (!resp?.ok) {
            return []
        }
        const states = await resp.json()
        states.forEach(state => {
            get().setNodeData(state.state_id, state)
        })
        return states
    },

    createState: async (nodeId) => {
        if (!nodeId) {
            console.log('warning: no node data found');
            return null;
        }

        const node = get().getNode(nodeId);
        const stateData = get().getNodeData(nodeId);
        return await get().saveState({
            id: node.id,
            state_type: stateData?.state_type || 'StateConfig',
            project_id: get().selectedProjectId,
            columns: stateData?.columns || {},
            properties: stateData?.properties || null,
            config: {
                ...(stateData?.config || {}),
                storage_class: 'database',
            },
        });
    },

    exportStateData: async(stateId, filename) => {
        const offset = 0
        const limit = 1000000000 // TODO needs to be properly set

        const params = new URLSearchParams({
            load_data: true,
            offset: String(offset),
            limit: String(limit),
        });

        const url = `${get().ISM_API_BASE_URL}/state/${encodeURIComponent(stateId)}/export?${params}`
        const resp = await get().authDownloadFile(url, filename)
        return resp?.ok;
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
            const response = await get().authFetch(`/state/${stateId}/data/upload`, {
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


    deleteProcessorStateWithWorkflowEdge: async (id) => {
        // Edge ID = processor_state route ID (state_id:processor_id for INPUT,
        // processor_id:state_id for OUTPUT). For connector edges, this is
        // embeddedStateId:processorId — the handle IDs ensure correctness.
        const routeDeleted = await get().deleteProcessorState(id);
        if (!routeDeleted) {
            console.error(`Aborting edge deletion — processor_state route ${id} could not be deleted`);
            return;
        }

        await get().deleteWorkflowEdge(id);
        const updatedEdges = get().workflowEdges.filter(edge => edge.id !== id);
        set({ workflowEdges: updatedEdges });
    },

    getNodeDataStateConfig: (nodeId) => {
        const node = get().getNode(nodeId)
        if (!node) {
            console.error(`no node found by id ${nodeId}`)
            return null
        }

        const nodeData = get().getNodeData(nodeId)

        // Initialize config if it doesn't exist
        if (!nodeData?.config) {
            // Don't mutate here - return a default config
            return {
                name: node?.data?.label || node?.node_label || '',
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
        const currentNodeData = get().getNodeData(nodeId)
        const updatedNodeData = {
            ...currentNodeData,
            columns: get().arrayToMap(columnsArray)
        }
        get().setNodeData(nodeId, updatedNodeData)
    },

    // TODO might be obsolete, its a way to send data directly to the api to push data into a state
    publishQueryState: async(stateId, queryState) => {
        const response = await get().authPost(`/state/${stateId}/forward/entry`, queryState);

        if (!response.ok) {
            // TODO proper error handling -- throw new Error('Network response error when trying to submit test query state for routing');
        }
    },

});

export default useStateSlice

