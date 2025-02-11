import {useCallback} from 'react';
import {applyNodeChanges} from "@xyflow/react"; // Adjust the path as necessary
import {useStore} from "./store";

const useEdgesStateSynced = () => {
    const { workflowEdges, setWorkflowEdges } = useStore()

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

    return [workflowEdges, setWorkflowEdges, onEdgesChange];
}

export default useEdgesStateSynced;
