import {useCallback, useMemo} from 'react';
import {applyEdgeChanges} from "@xyflow/react";
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

        // Apply edge changes (fixed: was using applyNodeChanges)
        const updatedEdges = applyEdgeChanges(changes, workflowEdges);
        console.log('Updated edges:', updatedEdges);

        // Update Zustand store directly with the new edges array
        setWorkflowEdges(updatedEdges);

    }, [workflowEdges, setWorkflowEdges]);

    return [visibleEdges, setWorkflowEdges, onEdgesChange];
}

export default useEdgesStateSynced;
