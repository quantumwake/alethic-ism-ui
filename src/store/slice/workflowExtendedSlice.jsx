export const useWorkflowExtendedSlice = (set, get) => ({


    createProcessorWithWorkflowNode: async (nodeData) => {
        const newNode = await get().createNewNode(nodeData)
        const newNodeData = await get().createProcessor(newNode.id)

        get().setNodeData(newNode.id, newNodeData)
    },

    createStateWithWorkflowNode: async (nodeData) => {
        const newNode = await get().createNewNode(nodeData)
        const newNodeData = await get().createState(newNode.id)
    },

    createTrainerWithWorkflowNode: async (nodeData) => {
        const newNode = await get().createNewNode(nodeData)
        // const newNodeData = await get().createState(newNode.id)
    },

    createProcessorStateWithWorkflowEdge: async (connection) => {
        // createProcessorState(connection.id, targetNode.id, sourceNode.id, "INPUT")

        const sourceNode = get().getNode(connection.source)
        const targetNode = get().getNode(connection.target)
        const sourceType = sourceNode.type
        const targetType = targetNode.type

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
            edge_label: "", // TODO make it editable?
            animated: false,
        }

        // if the target node is a processor then the target node id is a processor id
        if (targetNode.type.startsWith('processor')) {
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
        if (targetNode.type.startsWith('state')) {
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
        // get().createNewEdge(edge).then({
        //     get().createProcessorState(connection.id, targetNode.id, sourceNode.id, "INPUT")
        // })
    },

});

export default useWorkflowExtendedSlice

