import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
    KGraphCanvas,
    KGraphProvider,
    applyNodeChanges,
    applyEdgeChanges,
} from './kgraph';
import type {
    NodeChange,
    EdgeChange,
} from './kgraph';
import WithAuth from './WithAuth';
import { useStore } from './store';
import {
    Database,
    RefreshCcwIcon,
    BugOffIcon,
} from 'lucide-react';
import { TerminalButton } from './components/common';
import TerminalStreamDebug from './components/ism/TerminalStreamDebug';
import { customNodeTypes, customEdgeTypes, StudioToolbar } from './components/ism/kgraph';

// ============================================================================
// V3 Nodes/Edges state synced hooks (using KGraph applyChanges)
// ============================================================================

function useNodesStateSyncedV3() {
    const { workflowNodes, setWorkflowNodes, updateNode, getVisibleNodesAndEdges, collapsedNodes } = useStore();

    const visibleNodes = useMemo(() => {
        const { visibleNodes } = getVisibleNodesAndEdges();
        return visibleNodes;
    }, [workflowNodes, getVisibleNodesAndEdges, collapsedNodes]);

    const onNodesChange = useCallback((changes: NodeChange[]) => {
        const updatedNodes = applyNodeChanges(changes, workflowNodes);

        changes.forEach((change: any) => {
            if (change.type === 'position' && !change.dragging) {
                updateNode(change.id);
            }
        });

        setWorkflowNodes(updatedNodes);
    }, [workflowNodes, setWorkflowNodes, updateNode]);

    return [visibleNodes, setWorkflowNodes, onNodesChange] as const;
}

function useEdgesStateSyncedV3() {
    const { workflowEdges, setWorkflowEdges, getVisibleNodesAndEdges, collapsedNodes } = useStore();

    const visibleEdges = useMemo(() => {
        const { visibleEdges } = getVisibleNodesAndEdges();
        return visibleEdges;
    }, [workflowEdges, getVisibleNodesAndEdges, collapsedNodes]);

    const onEdgesChange = useCallback((changes: EdgeChange[]) => {
        const updatedEdges = applyEdgeChanges(changes, workflowEdges);
        setWorkflowEdges(updatedEdges);
    }, [workflowEdges, setWorkflowEdges]);

    return [visibleEdges, setWorkflowEdges, onEdgesChange] as const;
}

// ============================================================================
// Inner Studio Component
// ============================================================================

const StudioV3Inner: React.FC = () => {
    const {
        selectedProjectId,
        setSelectedNodeId,
        setSelectedEdgeId,
        createStateWithWorkflowNode,
        createProcessorWithWorkflowNode,
        createProcessorStateWithWorkflowEdge,
        fetchProjectProcessorStates,
        isStudioRefreshEnabled,
        setStudioIsRefreshEnabled,
    } = useStore();

    const [nodes, , onNodesChange] = useNodesStateSyncedV3();
    const [edges, , onEdgesChange] = useEdgesStateSyncedV3();
    const [isStreamDebugOpen, setIsStreamDebugOpen] = useState(false);
    const [isGridVisible, setIsGridVisible] = useState(true);
    const [isLocked, setIsLocked] = useState(false);
    const timeoutIdRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => {
        console.log('StudioV3 - Nodes:', nodes?.length, nodes);
        console.log('StudioV3 - Edges:', edges?.length, edges);
    }, [nodes, edges]);

    // Handle drop from palette
    const handleDrop = useCallback(async (event: React.DragEvent, position: { x: number; y: number }) => {
        // Accept both application/reactflow (existing palette) and application/kgraph
        const type = event.dataTransfer.getData('application/reactflow') || event.dataTransfer.getData('application/kgraph');
        if (!type || !selectedProjectId) return;

        const nodeData = {
            node_type: type,
            node_label: type,
            project_id: selectedProjectId,
            position_x: position.x,
            position_y: position.y,
            width: 100,
            height: 100,
        };

        if (type.startsWith('processor') || type.startsWith('function')) {
            await createProcessorWithWorkflowNode(nodeData);
        } else if (type.startsWith('state')) {
            await createStateWithWorkflowNode(nodeData);
        }
    }, [selectedProjectId, createProcessorWithWorkflowNode, createStateWithWorkflowNode]);

    // Handle new connections
    const handleConnect = useCallback((connection: { source: string; target: string; sourceHandle?: string; targetHandle?: string }) => {
        console.log('StudioV3 - New connection:', connection);
        createProcessorStateWithWorkflowEdge({
            source: connection.source,
            target: connection.target,
            sourceHandle: connection.sourceHandle,
            targetHandle: connection.targetHandle,
        });
    }, [createProcessorStateWithWorkflowEdge]);

    // Auto-refresh logic
    const refreshStudio = useCallback(() => {
        if (!isStudioRefreshEnabled) {
            clearTimeout(timeoutIdRef.current);
            return;
        }
        fetchProjectProcessorStates();
        timeoutIdRef.current = setTimeout(refreshStudio, 2000);
    }, [isStudioRefreshEnabled, fetchProjectProcessorStates]);

    useEffect(() => {
        refreshStudio();
        return () => clearTimeout(timeoutIdRef.current);
    }, [isStudioRefreshEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

    const toggleRefresh = () => setStudioIsRefreshEnabled(!isStudioRefreshEnabled);

    return (
        <div className="flex h-full w-full" style={{ backgroundColor: '#0e0e10' }}>
            {/* Global CSS for edge animations */}
            <style>{`
                @keyframes kgraph-flowDash {
                    to { stroke-dashoffset: -8; }
                }
                @keyframes kgraph-strokePulse {
                    0% { stroke-width: 1; }
                    50% { stroke-width: 4; }
                    100% { stroke-width: 1; }
                }
            `}</style>

            <div className="flex-1 relative">
                {/* Top-right toolbar */}
                <div className="z-50 absolute top-3 right-3 flex gap-2">
                    <TerminalButton onClick={toggleRefresh} variant={isStudioRefreshEnabled ? 'primary' : 'secondary'}>
                        <RefreshCcwIcon className={`w-4 h-4 ${isStudioRefreshEnabled ? 'animate-spin' : ''}`} />
                    </TerminalButton>
                    <TerminalButton onClick={() => setIsStreamDebugOpen(!isStreamDebugOpen)} variant="secondary">
                        <BugOffIcon className="w-4 h-4" />
                    </TerminalButton>
                </div>

                {selectedProjectId ? (
                    <KGraphCanvas
                        nodes={nodes || []}
                        edges={edges || []}
                        nodeTypes={customNodeTypes}
                        edgeTypes={customEdgeTypes}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={handleConnect}
                        onNodeClick={(e, node) => {
                            setSelectedNodeId(node.id);
                            setSelectedEdgeId(null);
                        }}
                        onEdgeClick={(e, edge) => {
                            setSelectedEdgeId(edge.id);
                            setSelectedNodeId(null);
                        }}
                        onPaneClick={() => {
                            setSelectedNodeId(null);
                            setSelectedEdgeId(null);
                        }}
                        onDrop={handleDrop}
                        showMiniMap={true}
                        showBackground={isGridVisible}
                        snapToGrid={true}
                        snapGrid={[16, 16]}
                        backgroundGap={32}
                        panOnDrag={!isLocked}
                        zoomOnScroll={!isLocked}
                        nodesDraggable={!isLocked}
                        nodesConnectable={!isLocked}
                        elementsSelectable={!isLocked}
                        fitView={true}
                    >
                        <StudioToolbar
                            isGridVisible={isGridVisible}
                            isLocked={isLocked}
                            onToggleGrid={() => setIsGridVisible(v => !v)}
                            onToggleLock={() => setIsLocked(v => !v)}
                        />
                    </KGraphCanvas>
                ) : (
                    <div className="flex items-center justify-center h-full text-midnight-text-subdued">
                        <div className="text-center">
                            <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Select a project to view the workflow</p>
                        </div>
                    </div>
                )}

                {isStreamDebugOpen && <TerminalStreamDebug />}
            </div>
        </div>
    );
};

// ============================================================================
// Main Export
// ============================================================================

const StudioV3: React.FC = () => {
    return <StudioV3Inner />;
};

export default WithAuth(StudioV3);
