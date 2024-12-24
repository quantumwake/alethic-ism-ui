import {useCallback} from 'react';

import useStore from './store';
import {applyNodeChanges, OnNodesChange} from "@xyflow/react"; // Path to your Zustand store

const useNodesStateSynced = () => {
    const { workflowNodes, setWorkflowNodes, updateNode } = useStore(state => ({
        workflowNodes: state.workflowNodes,
        setWorkflowNodes: state.setWorkflowNodes,
        updateNode: state.updateNode
    }));

    const onNodesChanges: OnNodesChange = useCallback((changes: any) => {
        // console.log('Node changes:', changes);

        // Apply changes directly
        const updatedNodes = applyNodeChanges(changes, workflowNodes);

        changes.forEach((change: any) => {
            if (!change.dragging) {
                console.log('Node move completed', changes);
                updateNode(change.id)
            }
        })

        // Update Zustand store directly with the new nodes array
        setWorkflowNodes(updatedNodes);

    }, [workflowNodes, setWorkflowNodes, updateNode]);

    return [workflowNodes, setWorkflowNodes, onNodesChanges]
}

export default useNodesStateSynced;
