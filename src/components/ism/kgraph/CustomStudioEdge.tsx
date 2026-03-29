import React, { useState } from 'react';
import { getBezierPath, useKGraphContext } from '@quantumwake/kgraph';
import type { EdgeComponentProps } from '@quantumwake/kgraph';
import { useStore } from '../../../store';
import { Play, Filter, Zap, Trash2 } from 'lucide-react';
import TerminalSyslog from '../TerminalSyslog';
import TerminalStateFilterDialog from '../TerminalStateFilterDialog';

const CustomStudioEdge: React.FC<EdgeComponentProps> = ({
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
        executeProcessorStateRoute,
        processorStates,
        isStudioRefreshEnabled,
    } = useStore();

    const edge = useStore(state => state.findWorkflowEdgeById(id));
    const edgeType = edge?.type || 'default';
    const status = processorStates?.[id]?.status || '';
    const { viewport } = useKGraphContext();

    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

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

    const handleDelete = () => deleteProcessorStateWithWorkflowEdge(id);
    const handlePlay = () => { if (edge) executeProcessorStateRoute(id); };
    const handleSettings = () => { setSelectedNodeId(null); setSelectedEdgeId(id); };

    const strokeColor = selected ? '#a78bfa' : (isHovered ? '#60a5fa' : getStatusColor());

    return (
        <g
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Defs for arrow marker and animations */}
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

            {/* Invisible wider hit area */}
            <path
                d={edgePath}
                fill="none"
                stroke="transparent"
                strokeWidth={20}
                onClick={() => setSelectedEdgeId(id)}
                style={{ cursor: 'pointer' }}
            />

            {/* Visible edge path */}
            <path
                id={id}
                d={edgePath}
                fill="none"
                stroke={strokeColor}
                strokeWidth={selected ? 2.5 : (isHovered ? 2 : 1.5)}
                markerEnd={`url(#arrow-${id})`}
                style={{
                    strokeDasharray: '6 3',
                    animation: isStudioRefreshEnabled
                        ? `kgraph-flowDash 0.5s linear infinite${status === 'FAILED' ? ', kgraph-strokePulse 2s ease-in-out infinite' : ''}`
                        : (status === 'FAILED' ? 'kgraph-strokePulse 2s ease-in-out infinite' : 'none'),
                    cursor: 'pointer',
                }}
                onClick={() => setSelectedEdgeId(id)}
            />

            {/* Edge toolbar - rendered as foreignObject so it stays in the SVG layer but shows HTML */}
            {(isHovered || selected) && (
                <foreignObject
                    x={labelX - 100}
                    y={labelY - 20}
                    width={200}
                    height={40}
                    style={{ overflow: 'visible', pointerEvents: 'none' }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%',
                            height: '100%',
                            pointerEvents: 'all',
                        }}
                    >
                        <div className="flex flex-row items-center gap-1 p-1 bg-midnight-surface/90 backdrop-blur-sm border border-midnight-border shadow-lg">
                            {edgeType === 'state_auto_stream_playable_edge' && (
                                <button
                                    onClick={handlePlay}
                                    className="p-1.5 bg-green-900/30 text-green-400 hover:bg-green-600 hover:text-white transition-colors"
                                    title="Execute Route"
                                >
                                    <Play className="w-3.5 h-3.5" />
                                </button>
                            )}
                            <button
                                onClick={() => setIsFilterDialogOpen(true)}
                                className="p-1.5 bg-blue-900/30 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                                title="Filter Data"
                            >
                                <Filter className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={handleSettings}
                                className="p-1.5 bg-purple-900/30 text-purple-400 hover:bg-purple-600 hover:text-white transition-colors"
                                title="Edge Settings"
                            >
                                <Zap className="w-3.5 h-3.5" />
                            </button>
                            <TerminalSyslog
                                buttonClass="p-1.5 bg-amber-900/30 text-amber-400 hover:bg-amber-600 hover:text-white transition-colors"
                                routeId={id}
                            />
                            <button
                                onClick={handleDelete}
                                className="p-1.5 bg-red-900/30 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                                title="Delete Edge"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </foreignObject>
            )}

            {/* Filter Dialog - rendered outside SVG via portal would be ideal, but this works */}
            {isFilterDialogOpen && (
                <foreignObject x={0} y={0} width={1} height={1} style={{ overflow: 'visible' }}>
                    <TerminalStateFilterDialog
                        isOpen={isFilterDialogOpen}
                        onClose={() => setIsFilterDialogOpen(false)}
                        filterId={id}
                        direction="input"
                    />
                </foreignObject>
            )}
        </g>
    );
};

export const customEdgeTypes: Record<string, React.ComponentType<EdgeComponentProps>> = {
    default: CustomStudioEdge,
    state_auto_stream_playable_edge: CustomStudioEdge,
};

export default CustomStudioEdge;
