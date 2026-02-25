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
import { TerminalButton, TerminalDialog, TerminalInput, TerminalLabel } from './components/common';
import TerminalStreamDebug from './components/ism/TerminalStreamDebug';
import { customNodeTypes, customEdgeTypes, StudioToolbar, useClusteredGraph, GroupFrameOverlay, NODE_WIDTH, NODE_HEIGHT } from './components/ism/kgraph';

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
        collapsedGroups,
        groupDefinitions,
        createGroup,
        deleteGroup,
        renameGroup,
        toggleGroupCollapse,
        getGroupMembers,
    } = useStore();

    const [rawNodes, , rawOnNodesChange] = useNodesStateSyncedV3();
    const [rawEdges, , rawOnEdgesChange] = useEdgesStateSyncedV3();

    // Clustering: transform raw nodes/edges into display nodes/edges
    const { displayNodes, displayEdges } = useClusteredGraph(
        rawNodes, rawEdges, collapsedGroups, groupDefinitions
    );
    const nodes = displayNodes;
    const edges = displayEdges;

    // Compute bounding boxes for expanded (non-collapsed) groups to render group frames
    const expandedGroups = useMemo(() => {
        const groups: { groupId: string; groupName: string; groupColor: string; memberNodeIds: string[]; bounds: { x: number; y: number; width: number; height: number } }[] = [];
        // Collect member positions per expanded group from display nodes
        const groupData = new Map<string, { nodeIds: string[]; rects: { x: number; y: number; w: number; h: number }[] }>();
        for (const node of displayNodes) {
            const gid = node.data?._groupId as string | undefined;
            if (!gid) continue;
            if (!groupData.has(gid)) groupData.set(gid, { nodeIds: [], rects: [] });
            const entry = groupData.get(gid)!;
            entry.nodeIds.push(node.id);
            const w = node.width || NODE_WIDTH;
            const h = node.height || NODE_HEIGHT;
            entry.rects.push({ x: node.position.x, y: node.position.y, w, h });
        }
        for (const [gid, { nodeIds, rects }] of groupData) {
            if (rects.length === 0) continue;
            const def = groupDefinitions[gid];
            if (!def) continue;
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            for (const m of rects) {
                minX = Math.min(minX, m.x);
                minY = Math.min(minY, m.y);
                maxX = Math.max(maxX, m.x + m.w);
                maxY = Math.max(maxY, m.y + m.h);
            }
            groups.push({
                groupId: gid,
                groupName: def.name,
                groupColor: def.color,
                memberNodeIds: nodeIds,
                bounds: { x: minX, y: minY, width: maxX - minX, height: maxY - minY },
            });
        }
        return groups;
    }, [displayNodes, groupDefinitions]);

    // Track last known cluster positions so we can compute drag deltas.
    // Seed from display nodes so the first drag event has a reference point.
    const clusterPositionsRef = useRef<Record<string, { x: number; y: number }>>({});
    for (const n of displayNodes) {
        if (n.id.startsWith('cluster-')) {
            const gid = n.id.replace('cluster-', '');
            clusterPositionsRef.current[gid] = { x: n.position.x, y: n.position.y };
        }
    }

    // Wrap onNodesChange: intercept cluster node drags → move all member nodes
    const onNodesChange = useCallback((changes: NodeChange[]) => {
        const realChanges: NodeChange[] = [];
        const memberPositionChanges: NodeChange[] = [];

        for (const c of changes) {
            const id = (c as any).id as string | undefined;
            if (!id?.startsWith('cluster-')) {
                realChanges.push(c);
                continue;
            }

            // Cluster node change — only handle position (ignore select, remove, etc.)
            if (c.type === 'position' && c.position) {
                const groupId = id.replace('cluster-', '');
                const prev = clusterPositionsRef.current[groupId];
                if (prev) {
                    const dx = c.position.x - prev.x;
                    const dy = c.position.y - prev.y;
                    // Move all member nodes by the same delta
                    const memberIds = getGroupMembers(groupId);
                    for (const memberId of memberIds) {
                        const memberNode = rawNodes.find(n => n.id === memberId);
                        if (memberNode) {
                            memberPositionChanges.push({
                                type: 'position',
                                id: memberId,
                                position: {
                                    x: memberNode.position.x + dx,
                                    y: memberNode.position.y + dy,
                                },
                                dragging: c.dragging,
                            });
                        }
                    }
                }
                clusterPositionsRef.current[groupId] = { x: c.position.x, y: c.position.y };
            }
        }

        const all = [...realChanges, ...memberPositionChanges];
        if (all.length) rawOnNodesChange(all);
    }, [rawOnNodesChange, rawNodes, getGroupMembers]);

    // Wrap onEdgesChange to filter out changes targeting remapped edges
    const onEdgesChange = useCallback((changes: EdgeChange[]) => {
        const filtered = changes.filter(c => !c.id?.startsWith('remapped-'));
        if (filtered.length) rawOnEdgesChange(filtered);
    }, [rawOnEdgesChange]);

    // Track selected node IDs for grouping
    const selectedNodeIds = useMemo(() => {
        return (rawNodes || []).filter(n => n.selected).map(n => n.id);
    }, [rawNodes]);
    // Ref keeps the latest selection available even if a re-render clears it between mouseup/click
    const selectedNodeIdsRef = useRef<string[]>(selectedNodeIds);
    selectedNodeIdsRef.current = selectedNodeIds;

    const [isStreamDebugOpen, setIsStreamDebugOpen] = useState(false);
    const [isGridVisible, setIsGridVisible] = useState(true);
    const [isLocked, setIsLocked] = useState(false);
    const timeoutIdRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    // Group naming dialog state
    const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
    const [groupDialogName, setGroupDialogName] = useState('');
    const pendingGroupIdsRef = useRef<string[]>([]);

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

    // Handle new connections (reject connections to/from cluster nodes)
    const handleConnect = useCallback((connection: { source: string; target: string; sourceHandle?: string; targetHandle?: string }) => {
        if (connection.source.startsWith('cluster-') || connection.target.startsWith('cluster-')) {
            console.warn('Cannot connect to/from a collapsed cluster. Expand the group first.');
            return;
        }
        console.log('StudioV3 - New connection:', connection);
        createProcessorStateWithWorkflowEdge({
            source: connection.source,
            target: connection.target,
            sourceHandle: connection.sourceHandle,
            targetHandle: connection.targetHandle,
        });
    }, [createProcessorStateWithWorkflowEdge]);

    // Handle group creation — opens a dialog for the group name
    const handleGroupSelected = useCallback(() => {
        const ids = selectedNodeIdsRef.current;
        if (ids.length < 2) return;
        pendingGroupIdsRef.current = [...ids];
        setGroupDialogName(`Group ${Object.keys(groupDefinitions).length + 1}`);
        setIsGroupDialogOpen(true);
    }, [groupDefinitions]);

    const handleGroupDialogConfirm = useCallback(() => {
        const ids = pendingGroupIdsRef.current;
        if (ids.length >= 2 && groupDialogName.trim()) {
            createGroup(ids, groupDialogName.trim());
        }
        setIsGroupDialogOpen(false);
        setGroupDialogName('');
        pendingGroupIdsRef.current = [];
    }, [groupDialogName, createGroup]);

    const handleGroupDialogClose = useCallback(() => {
        setIsGroupDialogOpen(false);
        setGroupDialogName('');
        pendingGroupIdsRef.current = [];
    }, []);

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
                        <GroupFrameOverlay
                            expandedGroups={expandedGroups}
                            rawNodes={rawNodes}
                            onNodesChange={onNodesChange}
                            onCollapse={toggleGroupCollapse}
                            onUngroup={deleteGroup}
                            onRename={renameGroup}
                        />
                        <StudioToolbar
                            isGridVisible={isGridVisible}
                            isLocked={isLocked}
                            onToggleGrid={() => setIsGridVisible(v => !v)}
                            onToggleLock={() => setIsLocked(v => !v)}
                            selectedNodeIds={selectedNodeIds}
                            onGroupSelected={handleGroupSelected}
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

                {/* Group naming dialog */}
                <TerminalDialog
                    isOpen={isGroupDialogOpen}
                    onClose={handleGroupDialogClose}
                    title="Create Group"
                >
                    <div className="space-y-4">
                        <div>
                            <TerminalLabel>Group Name</TerminalLabel>
                            <TerminalInput
                                value={groupDialogName}
                                onChange={(e) => setGroupDialogName(e.target.value)}
                                placeholder="Enter group name..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleGroupDialogConfirm();
                                }}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <TerminalButton variant="secondary" onClick={handleGroupDialogClose}>
                                Cancel
                            </TerminalButton>
                            <TerminalButton
                                variant="primary"
                                onClick={handleGroupDialogConfirm}
                                disabled={!groupDialogName.trim()}
                            >
                                Create Group
                            </TerminalButton>
                        </div>
                    </div>
                </TerminalDialog>
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
