export const useProcessorSlice = (set, get) => ({
    createProcessor: async (nodeId) => {
        if (!nodeId) {
            console.log('warning: no node data found')
        }

        const node = get().getNode(nodeId)
        const projectId = get().selectedProjectId
        let processorData = get().getNodeData(nodeId)
        const processorObject =
            {
                "id": node.id,
                "provider_id": processorData.provider_id,
                "status": "CREATED",
                "project_id": projectId,
                "name": processorData.name || "",
                "class_name": processorData.class_name || ""
            }

        const response = await get().authPost('/processor/create', processorObject);

        if (!response.ok) {
            // TODO proper error handling -- throw new Error('Network response was not ok');
        }

        // reassign the new state data returned, this will provide an updated list of ids if any
        processorData = await response.json();
        get().setNodeData(nodeId, processorData)
    },

    fetchProcessor: async (processorId, set_data = true) => {
        if (!processorId) {
            return
        }

        try {
            const response = await get().authGet(`/processor/${processorId}`)
            const processorData = await response.json();
            
            // Enrich the processor data with the class information
            if (processorData && processorData.provider_id) {
                const provider = get().getProviderById(processorData.provider_id);
                if (provider && provider.class_name) {
                    processorData.class_name = provider.class_name;
                } else {
                    console.warn(`Provider ${processorData.provider_id} not found or has no class_name`);
                }
            }
            
            if (set_data) {
                get().setNodeData(processorId, processorData)
            }
            return processorData
        } catch (error) {
            console.warn(`Warning, unable to fetch data for processor id: ${processorId} with error`, error);
        }
    },
    changeProcessorStatus: async (processorId, statusCode) => {
        const response = await get().authPost(`/processor/${processorId}/status/${statusCode}`, {});

        if (!response.ok) {
            // TODO proper error handling -- throw new Error('Network response was not ok');
        }

        const changed = await response.json();
        await get().fetchProcessor(processorId, true)
        return changed
    },
    fetchProcessors: async (project_id) => {
        try {
            const response = await get().authGet(`/project/${project_id}/processors`);
            const processors = await response.json();
            set({ processors });
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        }
    },
    deleteProcessor: async (processorId) => {
        const response = await get().authDelete(`/processor/${processorId}`);

        if (!response.ok) {
            // TODO proper error handling -- throw new Error('Network response was not ok');
        }

        // TODO delete the exact nodes and edges instead of doing a full refresh.
        const projectId = get().selectedProjectId
        await get().fetchWorkflowNodes(projectId);
        await get().fetchWorkflowEdges(projectId);
    },
});

export default useProcessorSlice