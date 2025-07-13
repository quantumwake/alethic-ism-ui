import {useCallback, useMemo} from 'react';
import {useStore} from "./store";
import {applyNodeChanges, OnNodesChange} from "@xyflow/react"; // Path to your Zustand store

const useNodesStateSynced = () => {
    const { workflowNodes, setWorkflowNodes, updateNode, getVisibleNodesAndEdges, collapsedNodes } = useStore();

    // Get visible nodes based on collapse state
    const visibleNodes = useMemo(() => {
        const { visibleNodes } = getVisibleNodesAndEdges();
        return visibleNodes;
    }, [workflowNodes, getVisibleNodesAndEdges, collapsedNodes]);

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

    return [visibleNodes, setWorkflowNodes, onNodesChanges]
}

export default useNodesStateSynced;
