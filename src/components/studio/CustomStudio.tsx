import React, { DragEvent, useCallback, useState, useMemo, useRef, useEffect } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    Panel,
    useReactFlow,
    Node,
    Edge,
    Connection,
    NodeTypes,
    EdgeTypes,
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    BackgroundVariant,
    NodeMouseHandler,
    SelectionMode,
    getBezierPath,
    EdgeProps,
    BaseEdge,
    Handle,
    Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '../../store';
import { Plus, Trash2, ZoomIn, ZoomOut, Maximize2, Grid3X3, Lock, Unlock } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface DiagramNode extends Node {
    data: {
        label?: string;
        type?: string;
        [key: string]: any;
    };
}

export interface DiagramEdge extends Edge {
    data?: {
        label?: string;
        [key: string]: any;
    };
}

export interface CustomStudioProps {
    // Core data - can be controlled externally
    nodes?: DiagramNode[];
    edges?: DiagramEdge[];
    initialNodes?: DiagramNode[];
    initialEdges?: DiagramEdge[];

    // Node/Edge types
    nodeTypes?: NodeTypes;
    edgeTypes?: EdgeTypes;

    // Callbacks
    onNodesChange?: OnNodesChange;
    onEdgesChange?: OnEdgesChange;
    onConnect?: OnConnect;
    onNodeCreate?: (node: DiagramNode) => void;
    onNodeDelete?: (nodeId: string) => void;
    onEdgeCreate?: (edge: DiagramEdge) => void;
    onEdgeDelete?: (edgeId: string) => void;
    onNodeSelect?: (node: DiagramNode | null) => void;
    onEdgeSelect?: (edge: DiagramEdge | null) => void;
    onDrop?: (event: DragEvent, position: { x: number; y: number }) => void;

    // Configuration
    connectionLineComponent?: React.ComponentType<any>;
    defaultNodeType?: string;
    defaultEdgeType?: string;
    snapToGrid?: boolean;
    snapGrid?: [number, number];
    showMiniMap?: boolean;
    showControls?: boolean;
    showBackground?: boolean;
    backgroundVariant?: BackgroundVariant;
    backgroundGap?: number;
    panOnDrag?: boolean;
    zoomOnScroll?: boolean;
    selectionOnDrag?: boolean;
    multiSelectionKeyCode?: string;
    deleteKeyCode?: string;

    // Toolbar
    showToolbar?: boolean;
    toolbarPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

    // Styling
    className?: string;
    style?: React.CSSProperties;
}

// ============================================================================
// Default Node Component
// ============================================================================

const DefaultNode: React.FC<{ data: any; selected: boolean }> = ({ data, selected }) => {
    const handleStyle = {
        width: 12,
        height: 12,
        borderRadius: '50%',
        border: '2px solid #8b5cf6',
        backgroundColor: '#0f0f18',
    };

    return (
        <div className={`
            px-4 py-3 rounded-lg border-2 min-w-[120px] relative
            bg-midnight-surface
            ${selected
                ? 'border-midnight-accent-bright shadow-midnight-glow'
                : 'border-midnight-border hover:border-midnight-border-glow'}
            transition-all duration-200
        `}>
            {/* Top handles */}
            <Handle id="target-1" type="target" position={Position.Top} style={handleStyle} />
            <Handle id="source-1" type="source" position={Position.Top} style={{ ...handleStyle, marginLeft: 16 }} />

            {/* Left handles */}
            <Handle id="target-2" type="target" position={Position.Left} style={handleStyle} />
            <Handle id="source-2" type="source" position={Position.Left} style={{ ...handleStyle, marginTop: 16 }} />

            {/* Right handles */}
            <Handle id="target-3" type="target" position={Position.Right} style={handleStyle} />
            <Handle id="source-3" type="source" position={Position.Right} style={{ ...handleStyle, marginTop: 16 }} />

            {/* Bottom handles */}
            <Handle id="target-4" type="target" position={Position.Bottom} style={handleStyle} />
            <Handle id="source-4" type="source" position={Position.Bottom} style={{ ...handleStyle, marginLeft: 16 }} />

            <div className="font-medium text-sm text-white">{data.label || 'Node'}</div>
            {data.description && (
                <div className="text-xs text-midnight-text-muted mt-1">{data.description}</div>
            )}
        </div>
    );
};

// ============================================================================
// Default Edge Component - Simple bezier edge
// ============================================================================

const CustomDefaultEdge: React.FC<EdgeProps> = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    selected,
    markerEnd,
    style,
}) => {
    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    return (
        <BaseEdge
            id={id}
            path={edgePath}
            markerEnd={markerEnd}
            style={{
                ...style,
                strokeWidth: selected ? 3 : 2,
                stroke: selected ? '#a78bfa' : '#3b82f6',
                strokeDasharray: '5,5',
            }}
        />
    );
};

// ============================================================================
// Toolbar Component
// ============================================================================

interface ToolbarProps {
    onAddNode: () => void;
    onDeleteSelected: () => void;
    onFitView: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onToggleGrid: () => void;
    onToggleLock: () => void;
    isGridVisible: boolean;
    isLocked: boolean;
    hasSelection: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
    onAddNode,
    onDeleteSelected,
    onFitView,
    onZoomIn,
    onZoomOut,
    onToggleGrid,
    onToggleLock,
    isGridVisible,
    isLocked,
    hasSelection,
}) => {
    const buttonClass = `
        p-2 rounded-md transition-all duration-200
        bg-midnight-surface hover:bg-midnight-elevated
        border border-midnight-border hover:border-midnight-border-glow
        text-midnight-text-body hover:text-midnight-accent-bright
    `;

    const activeClass = `
        p-2 rounded-md transition-all duration-200
        bg-midnight-info/20 hover:bg-midnight-info/30
        border border-midnight-info hover:border-midnight-info-bright
        text-midnight-info-bright
    `;

    return (
        <div className={`
            flex items-center gap-1 p-2 rounded-lg
            bg-midnight-surface/90 backdrop-blur-sm
            border border-midnight-border shadow-midnight-glow-sm
        `}>
            <button onClick={onAddNode} className={buttonClass} title="Add Node">
                <Plus className="w-4 h-4" />
            </button>

            <button
                onClick={onDeleteSelected}
                className={`${buttonClass} ${!hasSelection ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!hasSelection}
                title="Delete Selected"
            >
                <Trash2 className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-midnight-border mx-1" />

            <button onClick={onZoomIn} className={buttonClass} title="Zoom In">
                <ZoomIn className="w-4 h-4" />
            </button>

            <button onClick={onZoomOut} className={buttonClass} title="Zoom Out">
                <ZoomOut className="w-4 h-4" />
            </button>

            <button onClick={onFitView} className={buttonClass} title="Fit View">
                <Maximize2 className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-midnight-border mx-1" />

            <button
                onClick={onToggleGrid}
                className={isGridVisible ? activeClass : buttonClass}
                title="Toggle Grid"
            >
                <Grid3X3 className="w-4 h-4" />
            </button>

            <button
                onClick={onToggleLock}
                className={isLocked ? activeClass : buttonClass}
                title={isLocked ? "Unlock Canvas" : "Lock Canvas"}
            >
                {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
        </div>
    );
};

// ============================================================================
// Main CustomStudio Component
// ============================================================================

const CustomStudio: React.FC<CustomStudioProps> = ({
    nodes: controlledNodes,
    edges: controlledEdges,
    initialNodes = [],
    initialEdges = [],
    nodeTypes: customNodeTypes,
    edgeTypes: customEdgeTypes,
    onNodesChange: externalOnNodesChange,
    onEdgesChange: externalOnEdgesChange,
    onConnect: externalOnConnect,
    onNodeCreate,
    onNodeDelete,
    onEdgeCreate,
    onEdgeDelete,
    onNodeSelect,
    onEdgeSelect,
    onDrop: onDropCallback,
    connectionLineComponent,
    defaultNodeType = 'default',
    defaultEdgeType = 'default',
    snapToGrid = true,
    snapGrid = [16, 16],
    showMiniMap = true,
    showControls = false,
    showBackground = true,
    backgroundVariant = BackgroundVariant.Dots,
    backgroundGap = 24,
    panOnDrag = true,
    zoomOnScroll = true,
    selectionOnDrag = false,
    multiSelectionKeyCode = 'Shift',
    deleteKeyCode = 'Backspace',
    showToolbar = true,
    toolbarPosition = 'top-left',
    className = '',
    style = {},
}) => {
    const { screenToFlowPosition, fitView, zoomIn, zoomOut } = useReactFlow();

    // Determine if we're in controlled or uncontrolled mode
    const isControlled = controlledNodes !== undefined;

    // Internal state for uncontrolled mode
    const [internalNodes, setInternalNodes] = useState<DiagramNode[]>(initialNodes);
    const [internalEdges, setInternalEdges] = useState<DiagramEdge[]>(initialEdges);

    // Use controlled or internal state
    const nodes = isControlled ? controlledNodes : internalNodes;
    const edges = isControlled ? (controlledEdges || []) : internalEdges;

    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
    const [isGridVisible, setIsGridVisible] = useState(showBackground);
    const [isLocked, setIsLocked] = useState(false);

    const nodeIdCounter = useRef(initialNodes.length);

    // Merge default node types with custom
    const mergedNodeTypes: NodeTypes = useMemo(() => ({
        default: DefaultNode,
        ...customNodeTypes,
    }), [customNodeTypes]);

    // Merge default edge types with custom
    // Include common edge types that may come from the store
    const mergedEdgeTypes: EdgeTypes = useMemo(() => ({
        default: CustomDefaultEdge,
        state_auto_stream_playable_edge: CustomDefaultEdge,
        ...customEdgeTypes,
    }), [customEdgeTypes]);

    // Handlers
    const handleNodesChange: OnNodesChange = useCallback((changes) => {
        if (externalOnNodesChange) {
            externalOnNodesChange(changes);
        } else {
            setInternalNodes((nds) => applyNodeChanges(changes, nds) as DiagramNode[]);
        }
    }, [externalOnNodesChange]);

    const handleEdgesChange: OnEdgesChange = useCallback((changes) => {
        if (externalOnEdgesChange) {
            externalOnEdgesChange(changes);
        } else {
            setInternalEdges((eds) => applyEdgeChanges(changes, eds) as DiagramEdge[]);
        }
    }, [externalOnEdgesChange]);

    const handleConnect: OnConnect = useCallback((connection: Connection) => {
        if (externalOnConnect) {
            externalOnConnect(connection);
        } else {
            const newEdge: DiagramEdge = {
                ...connection,
                id: `edge-${Date.now()}`,
                type: defaultEdgeType,
            } as DiagramEdge;

            setInternalEdges((eds) => addEdge(newEdge, eds) as DiagramEdge[]);
            onEdgeCreate?.(newEdge);
        }
    }, [externalOnConnect, defaultEdgeType, onEdgeCreate]);

    const handleNodeClick: NodeMouseHandler = useCallback((_, node) => {
        setSelectedNodeId(node.id);
        setSelectedEdgeId(null);
        onNodeSelect?.(node as DiagramNode);
    }, [onNodeSelect]);

    const handleEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
        setSelectedEdgeId(edge.id);
        setSelectedNodeId(null);
        onEdgeSelect?.(edge as DiagramEdge);
    }, [onEdgeSelect]);

    const handlePaneClick = useCallback(() => {
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
        onNodeSelect?.(null);
        onEdgeSelect?.(null);
    }, [onNodeSelect, onEdgeSelect]);

    const handleDragOver = useCallback((event: DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const handleDrop = useCallback((event: DragEvent) => {
        event.preventDefault();

        if (isLocked) return;

        const position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });

        if (onDropCallback) {
            onDropCallback(event, position);
        } else if (!isControlled) {
            // Default drop behavior for uncontrolled mode
            const type = event.dataTransfer.getData('application/reactflow') || defaultNodeType;
            const label = event.dataTransfer.getData('application/label') || `Node ${++nodeIdCounter.current}`;

            const newNode: DiagramNode = {
                id: `node-${Date.now()}`,
                type,
                position,
                data: { label },
            };

            setInternalNodes((nds) => [...nds, newNode]);
            onNodeCreate?.(newNode);
        }
    }, [isLocked, screenToFlowPosition, onDropCallback, defaultNodeType, onNodeCreate, isControlled]);

    // Toolbar actions
    const handleAddNode = useCallback(() => {
        if (isControlled) return; // Don't add nodes in controlled mode via toolbar

        const newNode: DiagramNode = {
            id: `node-${Date.now()}`,
            type: defaultNodeType,
            position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
            data: { label: `Node ${++nodeIdCounter.current}` },
        };

        setInternalNodes((nds) => [...nds, newNode]);
        onNodeCreate?.(newNode);
    }, [defaultNodeType, onNodeCreate, isControlled]);

    const handleDeleteSelected = useCallback(() => {
        if (selectedNodeId) {
            if (!isControlled) {
                setInternalNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
                setInternalEdges((eds) => eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId));
            }
            onNodeDelete?.(selectedNodeId);
            setSelectedNodeId(null);
        }
        if (selectedEdgeId) {
            if (!isControlled) {
                setInternalEdges((eds) => eds.filter((e) => e.id !== selectedEdgeId));
            }
            onEdgeDelete?.(selectedEdgeId);
            setSelectedEdgeId(null);
        }
    }, [selectedNodeId, selectedEdgeId, onNodeDelete, onEdgeDelete, isControlled]);

    const handleFitView = useCallback(() => {
        fitView({ padding: 0.2 });
    }, [fitView]);

    const handleToggleGrid = useCallback(() => {
        setIsGridVisible((v) => !v);
    }, []);

    const handleToggleLock = useCallback(() => {
        setIsLocked((v) => !v);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === deleteKeyCode && (selectedNodeId || selectedEdgeId)) {
                handleDeleteSelected();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [deleteKeyCode, selectedNodeId, selectedEdgeId, handleDeleteSelected]);

    const hasSelection = selectedNodeId !== null || selectedEdgeId !== null;

    return (
        <div
            className={`w-full h-full bg-midnight-base ${className}`}
            style={style}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onConnect={handleConnect}
                onNodeClick={handleNodeClick}
                onEdgeClick={handleEdgeClick}
                onPaneClick={handlePaneClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                nodeTypes={mergedNodeTypes}
                edgeTypes={mergedEdgeTypes}
                connectionLineComponent={connectionLineComponent}
                snapToGrid={snapToGrid}
                snapGrid={snapGrid}
                panOnDrag={!isLocked && panOnDrag}
                zoomOnScroll={!isLocked && zoomOnScroll}
                nodesDraggable={!isLocked}
                nodesConnectable={!isLocked}
                elementsSelectable={!isLocked}
                selectionMode={selectionOnDrag ? SelectionMode.Partial : SelectionMode.Full}
                multiSelectionKeyCode={multiSelectionKeyCode}
                fitView
                proOptions={{ hideAttribution: true }}
            >
                {isGridVisible && (
                    <Background
                        variant={backgroundVariant}
                        gap={backgroundGap}
                        color="rgba(139, 92, 246, 0.15)"
                        size={1}
                    />
                )}

                {showControls && <Controls />}

                {showMiniMap && (
                    <MiniMap
                        nodeColor={() => '#8b5cf6'}
                        maskColor="rgba(8, 8, 12, 0.8)"
                        style={{
                            backgroundColor: '#0f0f18',
                            border: '1px solid #2a2a45',
                        }}
                    />
                )}

                {showToolbar && (
                    <Panel position="top-left">
                        <Toolbar
                            onAddNode={handleAddNode}
                            onDeleteSelected={handleDeleteSelected}
                            onFitView={handleFitView}
                            onZoomIn={() => zoomIn()}
                            onZoomOut={() => zoomOut()}
                            onToggleGrid={handleToggleGrid}
                            onToggleLock={handleToggleLock}
                            isGridVisible={isGridVisible}
                            isLocked={isLocked}
                            hasSelection={hasSelection}
                        />
                    </Panel>
                )}
            </ReactFlow>
        </div>
    );
};

export default CustomStudio;
