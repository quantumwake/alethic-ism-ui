import {useCallback, useMemo} from 'react';
import {applyNodeChanges} from "@xyflow/react"; // Adjust the path as necessary
import {useStore} from "./store";

const useEdgesStateSynced = () => {
    const { workflowEdges, setWorkflowEdges, getVisibleNodesAndEdges, collapsedNodes } = useStore()

    // Get visible edges based on collapse state
    const visibleEdges = useMemo(() => {
        const { visibleEdges } = getVisibleNodesAndEdges();
        return visibleEdges;
    }, [workflowEdges, getVisibleNodesAndEdges, collapsedNodes]);

    const onEdgesChange = useCallback((changes: any) => {
        console.log('Edge changes:', changes);

        // Apply changes directly
        const updatedEdges = applyNodeChanges(changes, workflowEdges);
        console.log('Updated edges:', updatedEdges);
        //
        // // check for any deletions
        // changes.forEach((change: any) => {
        //     if (change.type === 'remove') {
        //         console.log(`removing edge ${change})`)
        //         deleteWorkflowEdge(change.id)
        //     }
        // })

        // Update Zustand store directly with the new edges array
        setWorkflowEdges(updatedEdges);


    }, [workflowEdges, setWorkflowEdges]);

    return [visibleEdges, setWorkflowEdges, onEdgesChange];
}

export default useEdgesStateSynced;
