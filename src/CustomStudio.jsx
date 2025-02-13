import WithAuth from "./WithAuth";
import React from "react";
import TerminalFlow from "./components/canvas/TerminalFlow";
import TerminalFlowNode from "./components/canvas/TerminalFlowNode";

const nodeTypes = {
    "state": TerminalFlowNode
}

const CustomStudio = () => {
    const initialNodes = [
        {
            id: 'node-1',
            type: 'state',
            position: { x: 0, y: 0 },
            data: { name: 'State Node 1', type: 'state' }
        },
        {
            id: 'node-2',
            type: 'state',
            position: { x: 0, y: 150 },
            data: { name: 'State Node 2', type: 'state' }
        }
    ];

    const initialEdges = [
        {
            id: 'edge-1',
            source: 'node-1',
            target: 'node-2',
            sourceHandle: 'output',
            targetHandle: 'input'
        }
    ];
    return (
        <div className="relative flex-grow h-screen bg-[#1e1e1e] flex w-full">
        <TerminalFlow
            initialNodes={initialNodes}
            initialEdges={initialEdges}
            onNodesChange={(nodes) => console.log('Nodes updated:', nodes)}
            onEdgesChange={(edges) => console.log('Edges updated:', edges)}
            onConnect={(newEdge) => console.log('New connection:', newEdge)}
        />
        </div>
    )
};

export default WithAuth(CustomStudio)
