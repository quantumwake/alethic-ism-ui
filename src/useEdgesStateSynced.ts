import { useCallback } from 'react';
import {applyEdgeChanges, applyNodeChanges} from 'reactflow';
import useStore from './store'; // Adjust the path as necessary

const useEdgesStateSynced = () => {
    const { workflowEdges, setWorkflowEdges, deleteWorkflowEdge } = useStore((state) => ({
        workflowEdges: state.workflowEdges,
        setWorkflowEdges: state.setWorkflowEdges,
        deleteWorkflowEdge: state.deleteWorkflowEdge
    }));

    const onEdgesChange = useCallback((changes: any) => {
        console.log('Edge changes:', changes);

        // Apply changes directly
        const updatedEdges = applyNodeChanges(changes, workflowEdges);
        console.log('Updated edges:', updatedEdges);

        // check for any deletions
        changes.forEach((change: any) => {
            if (change.type === 'remove') {
                console.log(`removing edge ${change})`)
                deleteWorkflowEdge(change.id)
            }
        })

        // Update Zustand store directly with the new edges array
        setWorkflowEdges(updatedEdges);


    }, [workflowEdges, setWorkflowEdges]);

    return [workflowEdges, setWorkflowEdges, onEdgesChange];
}

export default useEdgesStateSynced;
