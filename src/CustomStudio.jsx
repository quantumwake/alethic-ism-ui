import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ReactFlowProvider, useReactFlow, Handle, Position, getBezierPath, EdgeLabelRenderer, BaseEdge, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import WithAuth from "./WithAuth";
import { useStore } from "./store";
import { CustomStudio as StudioCanvas } from './components/studio';
import useNodesStateSynced from "./useNodesStateSynced";
import useEdgesStateSynced from "./useEdgesStateSynced";
import {
    Cpu,
    Database,
    GitBranch,
    Hexagon,
    RefreshCcwIcon,
    BugOffIcon,
    Play,
    Pause,
    Trash2,
    Settings,
    Filter,
    Zap,
    FileText,
    Eye,
    Upload,
    Download,
    Eraser,
    CloudDownload,
    CloudUpload
} from 'lucide-react';
import { TerminalButton, TerminalDialogConfirmation } from "./components/common";
import TerminalStreamDebug from "./components/ism/TerminalStreamDebug";
import TerminalSyslog from "./components/ism/TerminalSyslog";
import TerminalStateFilterDialog from "./components/ism/TerminalStateFilterDialog";
import TerminalStateDataTable from "./components/ism/TerminalStateDataTable";
import TerminalStateUploadDialog from "./components/ism/TerminalStateUploadDialog";
import TerminalStateExportDialog from "./components/ism/TerminalStateExportDialog";
import TerminalStateImportHgDialog from "./components/ism/TerminalStateImportHgDialog";
import TerminalStateExportHgDialog from "./components/ism/TerminalStateExportHgDialog";

// ============================================================================
// Custom Edge Component with Hover Toolbar
// ============================================================================

const CustomStudioEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
    selected,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
    const {
        deleteProcessorStateWithWorkflowEdge,
        setSelectedEdgeId,
        setSelectedNodeId,
        findWorkflowEdgeById,
        executeProcessorStateRoute,
        processorStates,
        isStudioRefreshEnabled
    } = useStore();

    // Get edge data and status
    const edge = useStore(state => state.findWorkflowEdgeById(id));
    const edgeType = edge?.type || 'default';
    const status = processorStates?.[id]?.status || '';

    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    // Status-based colors
    const getStatusColor = () => {
        switch (status) {
            case 'CREATED': return '#9ca3af';
            case 'QUEUED': return '#4b5563';
            case 'ROUTE': return '#eab308';
            case 'ROUTED': return '#f59e0b';
            case 'RUNNING': return '#3b82f6';
            case 'COMPLETED': return '#22c55e';
            case 'FAILED': return '#ef4444';
            default: return '#8b5cf6';
        }
    };

    const handleDelete = () => {
        deleteProcessorStateWithWorkflowEdge(id);
    };

    const handlePlay = () => {
        if (edge) {
            executeProcessorStateRoute(id);
        }
    };

    const handleSettings = () => {
        setSelectedNodeId(null);
        setSelectedEdgeId(id);
    };

    const strokeColor = selected ? '#a78bfa' : (isHovered ? '#60a5fa' : getStatusColor());

    return (
        <>
            {/* SVG with animation keyframes */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    <marker
                        id={`arrow-${id}`}
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                    >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill={strokeColor} />
                    </marker>
                </defs>
                <style>
                    {`
                        @keyframes flowDash {
                            to { stroke-dashoffset: -8; }
                        }
                        @keyframes strokePulse {
                            0% { stroke-width: 1; }
                            50% { stroke-width: 4; }
                            100% { stroke-width: 1; }
                        }
                    `}
                </style>
            </svg>

            {/* Invisible wider path for easier hover/click detection */}
            <path
                d={edgePath}
                fill="none"
                stroke="transparent"
                strokeWidth={20}
                onClick={() => setSelectedEdgeId(id)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{ cursor: 'pointer' }}
            />

            {/* Visible edge path with dashed animation */}
            <path
                id={id}
                d={edgePath}
                fill="none"
                stroke={strokeColor}
                strokeWidth={selected ? 2.5 : (isHovered ? 2 : 1.5)}
                markerEnd={`url(#arrow-${id})`}
                style={{
                    ...style,
                    strokeDasharray: '6 3',
                    animation: isStudioRefreshEnabled
                        ? `flowDash 0.5s linear infinite${status === 'FAILED' ? ', strokePulse 2s ease-in-out infinite' : ''}`
                        : (status === 'FAILED' ? 'strokePulse 2s ease-in-out infinite' : 'none'),
                    cursor: 'pointer',
                }}
            />

            {/* Edge Toolbar - only show on hover or selection */}
            {(isHovered || selected) && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                            pointerEvents: 'all',
                        }}
                        className="nodrag nopan text-xs"
                    >
                        <div className="flex flex-row items-center gap-1 p-1  bg-midnight-surface/90 backdrop-blur-sm border border-midnight-border shadow-lg">
                            {/* Play button - only for playable edges */}
                            {edgeType === 'state_auto_stream_playable_edge' && (
                                <button
                                    onClick={handlePlay}
                                    className="p-1.5  bg-green-900/30 text-green-400 hover:bg-green-600 hover:text-white transition-colors"
                                    title="Execute Route"
                                >
                                    <Play className="w-3.5 h-3.5" />
                                </button>
                            )}

                            {/* Filter button */}
                            <button
                                onClick={() => setIsFilterDialogOpen(true)}
                                className="p-1.5  bg-blue-900/30 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                                title="Filter Data"
                            >
                                <Filter className="w-3.5 h-3.5" />
                            </button>

                            {/* Settings/Bolt button */}
                            <button
                                onClick={handleSettings}
                                className="p-1.5  bg-purple-900/30 text-purple-400 hover:bg-purple-600 hover:text-white transition-colors"
                                title="Edge Settings"
                            >
                                <Zap className="w-3.5 h-3.5" />
                            </button>

                            {/* Syslog button */}
                            <TerminalSyslog
                                buttonClass="p-1.5  bg-amber-900/30 text-amber-400 hover:bg-amber-600 hover:text-white transition-colors"
                                routeId={id}
                            />

                            {/* Delete button */}
                            <button
                                onClick={handleDelete}
                                className="p-1.5  bg-red-900/30 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                                title="Delete Edge"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </EdgeLabelRenderer>
            )}

            {/* Filter Dialog */}
            <TerminalStateFilterDialog
                isOpen={isFilterDialogOpen}
                onClose={() => setIsFilterDialogOpen(false)}
                filterId={id}
                direction="input"
            />
        </>
    );
};

// Custom edge types registry
const customEdgeTypes = {
    default: CustomStudioEdge,
    state_auto_stream_playable_edge: CustomStudioEdge,
};

// ============================================================================
// Node Toolbar Component (shown on hover/select)
// ============================================================================

const NodeToolbar = ({ nodeId, nodeType, actions = {}, isStopped }) => {
    const {
        onSettings,
        onDelete,
        onView,
        onExport,
        onImport,
        onImportHg,
        onExportHg,
        onPurge,
        onPlayPause
    } = actions;

    const isStateNode = nodeType === 'state';
    const isProcessorNode = nodeType === 'processor';

    return (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-midnight-surface/95 backdrop-blur-sm border border-midnight-border  shadow-lg z-10">
            {/* Processor Play/Pause */}
            {isProcessorNode && onPlayPause && (
                <button
                    onClick={(e) => { e.stopPropagation(); onPlayPause(); }}
                    className={`p-1.5 transition-colors ${isStopped ? 'bg-green-900/30 text-green-400 hover:bg-green-600 hover:text-white' : 'bg-red-900/30 text-red-400 hover:bg-red-600 hover:text-white'}`}
                    title={isStopped ? 'Start Processor' : 'Stop Processor'}
                >
                    {isStopped ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                </button>
            )}

            {/* State-specific actions */}
            {isStateNode && onView && (
                <button
                    onClick={(e) => { e.stopPropagation(); onView(); }}
                    className="p-1.5  bg-green-900/30 text-green-400 hover:bg-green-600 hover:text-white transition-colors"
                    title="View Data"
                >
                    <Eye className="w-3.5 h-3.5" />
                </button>
            )}

            {isStateNode && onExport && (
                <button
                    onClick={(e) => { e.stopPropagation(); onExport(); }}
                    className="p-1.5  bg-cyan-900/30 text-cyan-400 hover:bg-cyan-600 hover:text-white transition-colors"
                    title="Export Data"
                >
                    <Download className="w-3.5 h-3.5" />
                </button>
            )}

            {isStateNode && onImport && (
                <button
                    onClick={(e) => { e.stopPropagation(); onImport(); }}
                    className="p-1.5  bg-amber-900/30 text-amber-400 hover:bg-amber-600 hover:text-white transition-colors"
                    title="Import Data"
                >
                    <Upload className="w-3.5 h-3.5" />
                </button>
            )}

            {isStateNode && onImportHg && (
                <button
                    onClick={(e) => { e.stopPropagation(); onImportHg(); }}
                    className="p-1.5  bg-purple-900/30 text-purple-400 hover:bg-purple-600 hover:text-white transition-colors"
                    title="Import from HuggingFace"
                >
                    <CloudDownload className="w-3.5 h-3.5" />
                </button>
            )}

            {isStateNode && onExportHg && (
                <button
                    onClick={(e) => { e.stopPropagation(); onExportHg(); }}
                    className="p-1.5  bg-indigo-900/30 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
                    title="Export to HuggingFace"
                >
                    <CloudUpload className="w-3.5 h-3.5" />
                </button>
            )}

            {isStateNode && onPurge && (
                <button
                    onClick={(e) => { e.stopPropagation(); onPurge(); }}
                    className="p-1.5  bg-orange-900/30 text-orange-400 hover:bg-orange-600 hover:text-white transition-colors"
                    title="Purge Data"
                >
                    <Eraser className="w-3.5 h-3.5" />
                </button>
            )}

            {/* Common actions */}
            {onSettings && (
                <button
                    onClick={(e) => { e.stopPropagation(); onSettings(); }}
                    className="p-1.5  bg-blue-900/30 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                    title="Node Settings"
                >
                    <Settings className="w-3.5 h-3.5" />
                </button>
            )}

            {onDelete && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-1.5  bg-red-900/30 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                    title="Delete Node"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
};

// ============================================================================
// Handle rendering helper - Single handle per position (source & target overlap)
// With arrows showing direction, we only need one visible handle per side
// ============================================================================

const renderHandles = (color) => {
    const handleStyle = {
        width: 10,
        height: 10,
        background: color,
        border: '2px solid rgba(255,255,255,0.3)',
        borderRadius: '50%',
    };

    // Each position has overlapping source and target handles
    // They share the same visual position but maintain separate IDs for API compatibility
    return (
        <>
            {/* Top - single visual handle, both source and target */}
            <Handle id="target-1" type="target" position={Position.Top} style={handleStyle} />
            <Handle id="source-1" type="source" position={Position.Top} style={{ ...handleStyle, opacity: 0 }} />

            {/* Left - single visual handle, both source and target */}
            <Handle id="target-2" type="target" position={Position.Left} style={handleStyle} />
            <Handle id="source-2" type="source" position={Position.Left} style={{ ...handleStyle, opacity: 0 }} />

            {/* Right - single visual handle, both source and target */}
            <Handle id="target-3" type="target" position={Position.Right} style={handleStyle} />
            <Handle id="source-3" type="source" position={Position.Right} style={{ ...handleStyle, opacity: 0 }} />

            {/* Bottom - single visual handle, both source and target */}
            <Handle id="target-4" type="target" position={Position.Bottom} style={handleStyle} />
            <Handle id="source-4" type="source" position={Position.Bottom} style={{ ...handleStyle, opacity: 0 }} />
        </>
    );
};

// ============================================================================
// Consistent Node Size
// ============================================================================

const NODE_SIZE = 'w-52 min-h-[100px]';

// ============================================================================
// Custom Node Components - Themed for Midnight Lab with Hover Toolbars
// ============================================================================

const StateNodeComponent = ({ id, data, selected }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { deleteState, setSelectedNodeId, purgeStateData, getNodeData, fetchState, setNodeVisualCollapsed } = useStore();

    // Get collapsed state from store
    const isCollapsed = useStore(state => state.isNodeVisuallyCollapsed(id));
    const setIsCollapsed = (collapsed) => setNodeVisualCollapsed(id, collapsed);

    // Fetch state data on mount
    useEffect(() => {
        if (id) {
            fetchState(id);
        }
    }, [id, fetchState]);

    // Get fresh node data from store
    const nodeData = useStore(state => state.getNodeData(id)) || data || {};

    // Dialog states
    const [dialogs, setDialogs] = useState({
        view: false,
        upload: false,
        export: false,
        hgImport: false,
        hgExport: false,
        purgeConfirm: false,
        deleteConfirm: false
    });

    const toggleDialog = (dialog) => {
        setDialogs(prev => ({ ...prev, [dialog]: !prev[dialog] }));
    };

    const rowCount = nodeData?.count;
    const stateType = nodeData?.state_type || 'state';
    const configName = nodeData?.config?.name;

    // Double-click: if empty show upload, otherwise show view
    const handleDoubleClick = () => {
        if (!rowCount || rowCount === 0) {
            toggleDialog('upload');
        } else {
            toggleDialog('view');
        }
    };

    const toolbarActions = {
        onSettings: () => setSelectedNodeId(id),
        onDelete: () => toggleDialog('deleteConfirm'),
        onView: () => toggleDialog('view'),
        onExport: () => toggleDialog('export'),
        onImport: () => toggleDialog('upload'),
        onImportHg: () => toggleDialog('hgImport'),
        onExportHg: () => toggleDialog('hgExport'),
        onPurge: () => toggleDialog('purgeConfirm')
    };

    // Collapsed view
    if (isCollapsed) {
        return (
            <>
                <div
                    className={`
                        w-10 h-10 relative flex items-center justify-center cursor-pointer
                        bg-midnight-success/30 border-2 border-midnight-success/50
                        hover:border-midnight-success-bright hover:bg-midnight-success/50
                        ${selected ? 'border-midnight-success-bright shadow-midnight-success' : ''}
                        transition-all duration-200
                    `}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={() => setIsCollapsed(false)}
                    onDoubleClick={handleDoubleClick}
                    title={`${configName || stateType}${rowCount ? ` (${rowCount} rows)` : ''}\nClick to expand`}
                >
                    {renderHandles('#10b981')}
                    <Database className="w-5 h-5 text-midnight-success-bright" />
                </div>

                {/* Dialogs still available in collapsed state */}
                <TerminalStateDataTable isOpen={dialogs.view} onClose={() => toggleDialog('view')} nodeId={id} />
                <TerminalStateUploadDialog isOpen={dialogs.upload} setIsOpen={() => toggleDialog('upload')} nodeId={id} />
                <TerminalDialogConfirmation
                    isOpen={dialogs.deleteConfirm}
                    onAccept={() => { deleteState(id); toggleDialog('deleteConfirm'); }}
                    onCancel={() => toggleDialog('deleteConfirm')}
                    onClose={() => toggleDialog('deleteConfirm')}
                    title="Delete State"
                    content="Are you sure you wish to delete this state entirely?"
                />
            </>
        );
    }

    return (
        <>
            <div
                className={`
                    ${NODE_SIZE} px-3 py-2  relative
                    bg-gradient-to-br from-midnight-success/30 via-midnight-elevated to-midnight-surface
                    border-2 ${selected ? 'border-midnight-success-bright shadow-midnight-success' : 'border-midnight-border'}
                    transition-all duration-200
                `}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onDoubleClick={handleDoubleClick}
            >
                {(isHovered || selected) && (
                    <NodeToolbar nodeId={id} nodeType="state" actions={toolbarActions} />
                )}

                {renderHandles('#10b981')}

                {/* Header */}
                <div className="flex items-center gap-2 border-b border-midnight-border/50 pb-2 mb-2">
                    <Database className="w-4 h-4 text-midnight-success-bright flex-shrink-0" />
                    <span className="text-midnight-success-bright font-semibold text-xs uppercase tracking-wide truncate">
                        {stateType}
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsCollapsed(true); }}
                        className="ml-auto p-1 hover:bg-midnight-success/30 text-midnight-text-subdued hover:text-midnight-success-bright transition-colors"
                        title="Collapse"
                    >
                        <span className="text-xs">−</span>
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-1">
                    {configName && (
                        <div className="text-white text-sm font-medium truncate" title={configName}>
                            {configName}
                        </div>
                    )}
                    <div className="text-xs text-midnight-text-muted">
                        {rowCount !== undefined && rowCount > 0
                            ? <span className="text-midnight-success-bright">{rowCount} rows</span>
                            : <span className="text-midnight-text-subdued italic">Empty</span>
                        }
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            <TerminalStateDataTable
                isOpen={dialogs.view}
                onClose={() => toggleDialog('view')}
                nodeId={id}
            />

            <TerminalStateUploadDialog
                isOpen={dialogs.upload}
                setIsOpen={() => toggleDialog('upload')}
                nodeId={id}
            />

            <TerminalStateExportDialog
                isOpen={dialogs.export}
                setIsOpen={() => toggleDialog('export')}
                stateId={id}
            />

            <TerminalStateImportHgDialog
                isOpen={dialogs.hgImport}
                setIsOpen={() => toggleDialog('hgImport')}
                stateId={id}
            />

            <TerminalStateExportHgDialog
                isOpen={dialogs.hgExport}
                setIsOpen={() => toggleDialog('hgExport')}
                stateId={id}
            />

            <TerminalDialogConfirmation
                isOpen={dialogs.purgeConfirm}
                onAccept={() => { purgeStateData(id); toggleDialog('purgeConfirm'); }}
                onCancel={() => toggleDialog('purgeConfirm')}
                onClose={() => toggleDialog('purgeConfirm')}
                title="Purge State Data"
                content="This process is irreversible. Are you sure you wish to delete all data within the selected state?"
            />

            <TerminalDialogConfirmation
                isOpen={dialogs.deleteConfirm}
                onAccept={() => { deleteState(id); toggleDialog('deleteConfirm'); }}
                onCancel={() => toggleDialog('deleteConfirm')}
                onClose={() => toggleDialog('deleteConfirm')}
                title="Delete State"
                content="Are you sure you wish to delete this state entirely?"
            />
        </>
    );
};

const ProcessorNodeComponent = ({ id, data, selected }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { deleteProcessor, setSelectedNodeId, fetchProcessor, getNodeData, getProviderById, isNodeVisuallyCollapsed, setNodeVisualCollapsed, changeProcessorStatus } = useStore();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isStopped, setIsStopped] = useState(true);

    // Get collapsed state from store
    const isCollapsed = useStore(state => state.isNodeVisuallyCollapsed(id));
    const setIsCollapsed = (collapsed) => setNodeVisualCollapsed(id, collapsed);

    // Fetch processor data on mount and sync stopped status
    useEffect(() => {
        if (id) {
            fetchProcessor(id).then((processorData) => {
                if (processorData?.status) {
                    setIsStopped(['TERMINATE', 'STOPPED'].includes(processorData.status));
                }
            });
        }
    }, [id, fetchProcessor]);

    // Get fresh node data and provider from store
    const nodeData = useStore(state => state.getNodeData(id)) || data || {};
    const provider = useStore(state => state.getProviderById(nodeData?.provider_id));

    const processorType = nodeData?.processor_type || data?.type || 'processor';
    const providerName = provider?.name || '';
    const providerClass = provider?.class_name || '';
    const providerVersion = provider?.version || '';

    // Map processor type to display name
    const getDisplayType = () => {
        const typeMap = {
            'processor_openai': 'OpenAI',
            'processor_anthropic': 'Anthropic',
            'processor_google_ai': 'Google AI',
            'processor_llama': 'Llama',
            'processor_mistral': 'Mistral',
            'processor_python': 'Python',
            'processor_visual_openai': 'Vision',
            'processor_provider': providerName || 'Provider',
            'processor_state_coalescer': 'Coalescer',
            'processor_state_composite': 'Composite',
        };
        return typeMap[processorType] || processorType.replace('processor_', '').replace(/_/g, ' ');
    };

    const startOrStopProcessor = useCallback(async () => {
        const newStatus = isStopped ? 'COMPLETED' : 'TERMINATE';
        await changeProcessorStatus(id, newStatus);
        const currentNode = getNodeData(id);
        setIsStopped(['TERMINATE', 'STOPPED'].includes(currentNode?.status));
    }, [id, isStopped, changeProcessorStatus, getNodeData]);

    const toolbarActions = {
        onSettings: () => setSelectedNodeId(id),
        onDelete: () => setShowDeleteConfirm(true),
        onPlayPause: startOrStopProcessor
    };

    // Collapsed view - small compact indicator
    if (isCollapsed) {
        return (
            <>
                <div
                    className={`
                        w-10 h-10  relative flex items-center justify-center cursor-pointer
                        bg-midnight-warning/30 border-2 border-midnight-warning/50
                        hover:border-midnight-warning-bright hover:bg-midnight-warning/50
                        ${selected ? 'border-midnight-warning-bright shadow-[0_0_15px_rgba(245,158,11,0.4)]' : ''}
                        transition-all duration-200
                    `}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={() => setIsCollapsed(false)}
                    title={`${getDisplayType()}${providerName ? `: ${providerName}` : ''}\nClick to expand`}
                >
                    {renderHandles('#f59e0b')}
                    <Cpu className="w-5 h-5 text-midnight-warning-bright" />
                </div>

                <TerminalDialogConfirmation
                    isOpen={showDeleteConfirm}
                    onAccept={() => { deleteProcessor(id); setShowDeleteConfirm(false); }}
                    onCancel={() => setShowDeleteConfirm(false)}
                    onClose={() => setShowDeleteConfirm(false)}
                    title="Delete Processor"
                    content="Are you sure you wish to delete this processor and all its connections?"
                />
            </>
        );
    }

    // Expanded view (default)
    return (
        <>
            <div
                className={`
                    ${NODE_SIZE} px-3 py-2  relative
                    bg-gradient-to-br from-midnight-warning/30 via-midnight-elevated to-midnight-surface
                    border-2 ${selected ? 'border-midnight-warning-bright shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'border-midnight-border'}
                    transition-all duration-200
                `}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {(isHovered || selected) && (
                    <NodeToolbar nodeId={id} nodeType="processor" actions={toolbarActions} isStopped={isStopped} />
                )}

                {renderHandles('#f59e0b')}

                {/* Header */}
                <div className="flex items-center gap-2 border-b border-midnight-border/50 pb-2 mb-2">
                    <Cpu className="w-4 h-4 text-midnight-warning-bright flex-shrink-0" />
                    <span className="text-midnight-warning-bright font-semibold text-xs uppercase tracking-wide truncate">
                        {getDisplayType()}
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsCollapsed(true); }}
                        className="ml-auto p-1  hover:bg-midnight-warning/30 text-midnight-text-subdued hover:text-midnight-warning-bright transition-colors"
                        title="Collapse"
                    >
                        <span className="text-xs">−</span>
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-1">
                    {providerName && (
                        <div className="text-white text-sm font-medium truncate" title={providerName}>
                            {providerName}
                        </div>
                    )}
                    {providerClass && (
                        <div className="text-xs text-midnight-warning-bright truncate" title={providerClass}>
                            {providerClass}
                        </div>
                    )}
                    {providerVersion && (
                        <div className="text-xs text-midnight-text-muted">
                            v{providerVersion}
                        </div>
                    )}
                </div>
            </div>

            <TerminalDialogConfirmation
                isOpen={showDeleteConfirm}
                onAccept={() => { deleteProcessor(id); setShowDeleteConfirm(false); }}
                onCancel={() => setShowDeleteConfirm(false)}
                onClose={() => setShowDeleteConfirm(false)}
                title="Delete Processor"
                content="Are you sure you wish to delete this processor and all its connections?"
            />
        </>
    );
};

const TransformNodeComponent = ({ id, data, selected }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { deleteProcessor, setSelectedNodeId, getNodeData, getProviderById } = useStore();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const nodeData = useStore(state => state.getNodeData(id)) || data || {};
    const provider = useStore(state => state.getProviderById(nodeData?.provider_id));

    const processorType = nodeData?.processor_type || data?.type || '';
    const providerName = provider?.name || '';

    const getDisplayType = () => {
        if (processorType.includes('coalescer')) return 'State Coalescer';
        if (processorType.includes('composite')) return 'State Composite';
        return 'Transform';
    };

    const toolbarActions = {
        onSettings: () => setSelectedNodeId(id),
        onDelete: () => setShowDeleteConfirm(true)
    };

    return (
        <>
            <div
                className={`
                    ${NODE_SIZE} px-3 py-2  relative
                    bg-gradient-to-br from-midnight-accent/30 via-midnight-elevated to-midnight-surface
                    border-2 ${selected ? 'border-midnight-accent-bright shadow-midnight-glow' : 'border-midnight-border'}
                    transition-all duration-200
                `}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {(isHovered || selected) && (
                    <NodeToolbar nodeId={id} nodeType="transform" actions={toolbarActions} />
                )}

                {renderHandles('#8b5cf6')}

                {/* Header */}
                <div className="flex items-center gap-2 border-b border-midnight-border/50 pb-2 mb-2">
                    <GitBranch className="w-4 h-4 text-midnight-accent-bright flex-shrink-0" />
                    <span className="text-midnight-accent-bright font-semibold text-xs uppercase tracking-wide truncate">
                        {getDisplayType()}
                    </span>
                </div>

                {/* Content */}
                <div className="space-y-1">
                    {providerName && (
                        <div className="text-white text-sm font-medium truncate" title={providerName}>
                            {providerName}
                        </div>
                    )}
                    <div className="text-xs text-midnight-text-muted">
                        Combines multiple states
                    </div>
                </div>
            </div>

            <TerminalDialogConfirmation
                isOpen={showDeleteConfirm}
                onAccept={() => { deleteProcessor(id); setShowDeleteConfirm(false); }}
                onCancel={() => setShowDeleteConfirm(false)}
                onClose={() => setShowDeleteConfirm(false)}
                title="Delete Transform"
                content="Are you sure you wish to delete this transform node?"
            />
        </>
    );
};

const FunctionNodeComponent = ({ id, data, selected }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { deleteProcessor, setSelectedNodeId, getNodeData, getProviderById } = useStore();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const nodeData = useStore(state => state.getNodeData(id)) || data || {};
    const provider = useStore(state => state.getProviderById(nodeData?.provider_id));

    const processorType = nodeData?.processor_type || data?.type || '';
    const providerName = provider?.name || '';
    const configName = nodeData?.config?.name;

    const getDisplayType = () => {
        if (processorType.includes('sql')) return 'SQL Query';
        if (processorType.includes('datasource')) return 'Data Source';
        return 'Function';
    };

    const toolbarActions = {
        onSettings: () => setSelectedNodeId(id),
        onDelete: () => setShowDeleteConfirm(true)
    };

    return (
        <>
            <div
                className={`
                    ${NODE_SIZE} px-3 py-2  relative
                    bg-gradient-to-br from-midnight-warning/30 via-midnight-elevated to-midnight-surface
                    border-2 ${selected ? 'border-midnight-warning-bright shadow-midnight-glow' : 'border-midnight-border'}
                    transition-all duration-200
                `}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {(isHovered || selected) && (
                    <NodeToolbar nodeId={id} nodeType="function" actions={toolbarActions} />
                )}

                {renderHandles('#f59e0b')}

                {/* Header */}
                <div className="flex items-center gap-2 border-b border-midnight-border/50 pb-2 mb-2">
                    <Hexagon className="w-4 h-4 text-midnight-warning-bright flex-shrink-0" />
                    <span className="text-midnight-warning-bright font-semibold text-xs uppercase tracking-wide truncate">
                        {getDisplayType()}
                    </span>
                </div>

                {/* Content */}
                <div className="space-y-1">
                    {providerName && (
                        <div className="text-white text-sm font-medium truncate" title={providerName}>
                            {providerName}
                        </div>
                    )}
                    {configName && (
                        <div className="text-xs text-midnight-warning-bright truncate" title={configName}>
                            {configName}
                        </div>
                    )}
                    {!providerName && !configName && (
                        <div className="text-xs text-midnight-text-muted">
                            External data function
                        </div>
                    )}
                </div>
            </div>

            <TerminalDialogConfirmation
                isOpen={showDeleteConfirm}
                onAccept={() => { deleteProcessor(id); setShowDeleteConfirm(false); }}
                onCancel={() => setShowDeleteConfirm(false)}
                onClose={() => setShowDeleteConfirm(false)}
                title="Delete Function"
                content="Are you sure you wish to delete this function node?"
            />
        </>
    );
};

// Node types registry - matching Studio.tsx types
const customNodeTypes = {
    state: StateNodeComponent,
    processor_python: ProcessorNodeComponent,
    processor_openai: ProcessorNodeComponent,
    processor_visual_openai: ProcessorNodeComponent,
    processor_google_ai: ProcessorNodeComponent,
    processor_anthropic: ProcessorNodeComponent,
    processor_llama: ProcessorNodeComponent,
    processor_mistral: ProcessorNodeComponent,
    processor_state_coalescer: TransformNodeComponent,
    processor_state_composite: TransformNodeComponent,
    processor_provider: ProcessorNodeComponent,
    trainer: ProcessorNodeComponent,
    function_datasource_sql: FunctionNodeComponent,
};

// ============================================================================
// Inner Studio Component (needs ReactFlowProvider context)
// ============================================================================

const CustomStudioInner = () => {
    const { screenToFlowPosition } = useReactFlow();
    const {
        selectedProjectId,
        setSelectedNodeId,
        setSelectedEdgeId,
        createStateWithWorkflowNode,
        createProcessorWithWorkflowNode,
        createProcessorStateWithWorkflowEdge,
        fetchProjectProcessorStates,
        isStudioRefreshEnabled,
        setStudioIsRefreshEnabled
    } = useStore();

    const [nodes, setNodes, onNodesChange] = useNodesStateSynced();
    const [edges, setEdges, onEdgesChange] = useEdgesStateSynced();
    const [isStreamDebugOpen, setIsStreamDebugOpen] = useState(false);
    const timeoutIdRef = useRef();

    // Debug: Log nodes and edges
    useEffect(() => {
        console.log('CustomStudio - Nodes:', nodes?.length, nodes);
        console.log('CustomStudio - Edges:', edges?.length, edges);
    }, [nodes, edges]);

    // Handle drop from palette (ComponentTab2)
    const handleDrop = useCallback(async (event, position) => {
        const type = event.dataTransfer.getData('application/reactflow');

        if (!type || !selectedProjectId) return;

        const nodeData = {
            node_type: type,
            node_label: type,
            project_id: selectedProjectId,
            position_x: position.x,
            position_y: position.y,
            width: 100,
            height: 100
        };

        if (type.startsWith('processor') || type.startsWith('function')) {
            await createProcessorWithWorkflowNode(nodeData);
        } else if (type.startsWith('state')) {
            await createStateWithWorkflowNode(nodeData);
        }
    }, [selectedProjectId, createProcessorWithWorkflowNode, createStateWithWorkflowNode]);

    // Handle new connections
    const handleConnect = useCallback((connection) => {
        console.log('CustomStudio - New connection:', connection);
        createProcessorStateWithWorkflowEdge({
            source: connection.source,
            target: connection.target,
            sourceHandle: connection.sourceHandle,
            targetHandle: connection.targetHandle
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
    }, [isStudioRefreshEnabled]);

    const toggleRefresh = () => {
        setStudioIsRefreshEnabled(!isStudioRefreshEnabled);
    };

    return (
        <div className="flex h-full w-full" style={{ backgroundColor: '#0e0e10' }}>
            <div className="flex-1 relative">
                {/* Toolbar */}
                <div className="z-50 absolute top-3 right-3 flex gap-2">
                    <TerminalButton onClick={toggleRefresh} variant={isStudioRefreshEnabled ? "primary" : "secondary"}>
                        <RefreshCcwIcon className={`w-4 h-4 ${isStudioRefreshEnabled ? 'animate-spin' : ''}`} />
                    </TerminalButton>
                    <TerminalButton onClick={() => setIsStreamDebugOpen(!isStreamDebugOpen)} variant="secondary">
                        <BugOffIcon className="w-4 h-4" />
                    </TerminalButton>
                </div>

                {selectedProjectId ? (
                    <StudioCanvas
                        nodes={nodes || []}
                        edges={edges || []}
                        nodeTypes={customNodeTypes}
                        edgeTypes={customEdgeTypes}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={handleConnect}
                        onNodeSelect={(node) => {
                            if (node) setSelectedNodeId(node.id);
                        }}
                        onEdgeSelect={(edge) => {
                            if (edge) setSelectedEdgeId(edge.id);
                        }}
                        onDrop={handleDrop}
                        showMiniMap={true}
                        showToolbar={true}
                        toolbarPosition="top-left"
                        snapToGrid={true}
                        snapGrid={[16, 16]}
                        backgroundGap={32}
                    />
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
// Main Component with Provider
// ============================================================================

const CustomStudio = () => {
    return (
        <ReactFlowProvider>
            <CustomStudioInner />
        </ReactFlowProvider>
    );
};

export default WithAuth(CustomStudio);
