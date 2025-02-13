import {useRef, useState} from "react";
import TerminalFlowEdge from "./TerminalFlowEdge";
import TerminalFlowNode from "./TerminalFlowNode";

const TerminalFlow = ({
                          initialNodes = [],
                          initialEdges = [],
                          onNodesChange,
                          onEdgesChange,
                          onConnect
                      }) => {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);
    const [selectedNode, setSelectedNode] = useState(null);
    const [drawingEdge, setDrawingEdge] = useState(null);
    const canvasRef = useRef(null);
    const svgRef = useRef(null);

    // Handle node position updates
    const handleNodePositionChange = (id, newPosition) => {
        setNodes(prev => prev.map(node =>
            node.id === id ? { ...node, position: newPosition } : node
        ));
    };

    // Handle edge drawing
    const handleMouseDown = (e) => {
        const handle = e.target.getAttribute('data-handle');
        const nodeId = e.target.getAttribute('data-node-id');

        if (handle && nodeId) {
            const rect = svgRef.current.getBoundingClientRect();
            setDrawingEdge({
                source: nodeId,
                sourceHandle: handle,
                sourcePos: {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                }
            });
        }
    };

    const handleMouseMove = (e) => {
        if (drawingEdge) {
            const rect = svgRef.current.getBoundingClientRect();
            setDrawingEdge(prev => ({
                ...prev,
                targetPos: {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                }
            }));
        }
    };

    const handleMouseUp = (e) => {
        if (drawingEdge) {
            const handle = e.target.getAttribute('data-handle');
            const nodeId = e.target.getAttribute('data-node-id');

            if (handle && nodeId && nodeId !== drawingEdge.source) {
                const newEdge = {
                    id: `${drawingEdge.source}:${nodeId}`,
                    source: drawingEdge.source,
                    target: nodeId,
                    sourceHandle: drawingEdge.sourceHandle,
                    targetHandle: handle
                };

                setEdges(prev => [...prev, newEdge]);
                onConnect?.(newEdge);
            }
            setDrawingEdge(null);
        }
    };

    return (
        <div ref={canvasRef}>
            <svg
                ref={svgRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            >
                {/* Draw existing edges */}
                {edges.map(edge => {
                    const sourceNode = nodes.find(n => n.id === edge.source);
                    const targetNode = nodes.find(n => n.id === edge.target);

                    if (!sourceNode || !targetNode) return null;

                    return (
                        <TerminalFlowEdge
                            key={edge.id}
                            source={edge.source}
                            target={edge.target}
                            sourcePos={{
                                x: sourceNode.position.x - 10,
                                y: sourceNode.position.y + 50
                            }}
                            targetPos={{
                                x: targetNode.position.x + 50,
                                y: targetNode.position.y + 50
                            }}
                        />
                    );
                })}

                {/* Draw edge being created */}
                {drawingEdge && drawingEdge.targetPos && (
                    <TerminalFlowEdge
                        source={drawingEdge.source}
                        sourcePos={drawingEdge.sourcePos}
                        targetPos={drawingEdge.targetPos}
                    />
                )}
            </svg>

            {/* Render nodes */}
            {nodes.map(node => (
                <TerminalFlowNode
                    key={node.id}
                    {...node}
                    selected={selectedNode === node.id}
                    onSelect={setSelectedNode}
                    onPositionChange={handleNodePositionChange}
                />
            ))}
        </div>
    );
};

export default TerminalFlow