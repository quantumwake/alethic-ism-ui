export const useWorkflowExtendedSlice = (set, get) => ({


    createProcessorWithWorkflowNode: async (nodeData) => {
        const newNode = await get().createNewNode(nodeData)
        const newNodeData = await get().createProcessor(newNode.id)

        get().setNodeData(newNode.id, newNodeData)
        return newNode
    },

    createStateWithWorkflowNode: async (nodeData) => {
        const newNode = await get().createNewNode(nodeData)
        const newNodeData = await get().createState(newNode.id)
        return newNode
    },

    createTrainerWithWorkflowNode: async (nodeData) => {
        const newNode = await get().createNewNode(nodeData)
        // const newNodeData = await get().createState(newNode.id)
    },

    createProcessorStateWithWorkflowEdge: async (connection) => {
        const sourceNode = get().getNode(connection.source)
        const targetNode = get().getNode(connection.target)
        const sourceType = sourceNode.type
        const targetType = targetNode.type

        // Helper: check if a node type is a processor (includes function_* types)
        const isProcessor = (type) => type?.startsWith('processor') || type?.startsWith('function')

        // check to ensure that the source node to the target node is not of same type
        if (sourceType === targetType) {
            console.error(`unable to connect ${sourceType} to ${targetType}, invalid connection`)
            return
        }

        // persist the workflow edge configuration
        let newConnection= {
            source_node_id: connection.source,
            target_node_id: connection.target,
            source_handle: connection.sourceHandle,
            target_handle: connection.targetHandle,
            type: 'default',
            edge_label: "",
            animated: false,
        }

        // if the target node is a processor then the target node id is a processor id
        // INPUT direction: state → processor
        if (isProcessor(targetType)) {
            newConnection.type = 'state_auto_stream_playable_edge'
            await get().createNewEdge(newConnection).then((updatedEdge) => {
                get().createProcessorState(
                    {
                        "id": updatedEdge.id,
                        "processor_id": updatedEdge.target,
                        "state_id": updatedEdge.source,
                        "direction": "INPUT"
                    }
                )
            })
        }

        // if the target node is a state then the target node id is a state id
        // OUTPUT direction: processor → state
        if (targetType === 'state') {
            newConnection.type = 'default'
            await get().createNewEdge(newConnection).then((updatedEdge) => {
                get().createProcessorState(
                    {
                        "id": updatedEdge.id,
                        "processor_id": updatedEdge.source,
                        "state_id": updatedEdge.target,
                        "direction": "OUTPUT"
                    }
                )
            })
        }
    },

});

export default useWorkflowExtendedSlice

