import React, {useEffect, useState} from 'react';
import {useStore} from "../store";
import {faFilter, faPlay, faRemove, faBolt} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {EdgeLabelRenderer, EdgeProps, getBezierPath} from "@xyflow/react";
import TerminalSyslog from "../components/ism/TerminalSyslog";
import TerminalStateFilterDialog from "../components/ism/TerminalStateFilterDialog";

function CustomEdge({   id, sourceX, sourceY, targetX, targetY,
                                                        sourcePosition, targetPosition,
                                                        style = {}, markerStart,
                                                        markerEnd}: EdgeProps) {

    const theme = useStore((state: any) => state.getCurrentTheme())
    const [isHovered, setIsHovered] = useState(false);
    const [edge, setEdge] = useState()
    const [status, setStatus] = useState('')
    const {workflowEdges, findWorkflowEdgeById, deleteProcessorStateWithWorkflowEdge, executeProcessorStateRoute} = useStore()
    const {selectedEdgeId, setSelectedEdgeId, setSelectedNodeId, processorStates} = useStore()
    const isSelected = selectedEdgeId === id;
    const {isStudioRefreshEnabled} = useStore()
    const [isOpenStateDataFilterDialog, setIsOpenStateDataFilterDialog] = useState(false);
    const [isOpenSyslogDialog, setIsOpenSyslogDialog] = useState(false);

    useEffect(() => {
        console.debug(`*************is animated: ${isStudioRefreshEnabled}`)
    }, [isStudioRefreshEnabled]);

    const getEdgeType = () => {
        if (edge) {
            return edge['type']
        }
        return 'default'
    }

    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    useEffect(() => {
        if (workflowEdges) {
            const edge = findWorkflowEdgeById(id)
            setEdge(edge)
        }
    }, [workflowEdges])

    useEffect(() => {
        if (id in processorStates) {
            const ps = processorStates[id]
            setStatus(ps.status)
            console.info(`processor state found ${id} with ${processorStates}`)
        }
    }, [processorStates])

    // const onEdgeClick = (edgeId: string) => {
    //     console.log(`hello world edge id: ${edgeId}`)
    //     const edge = findWorkflowEdgeById(edgeId)
    //     if (edge) {
    //         const stateId = edge.source
    //         const processorId = edge.target
    //
    //
    //         console.log(`executing state id: ${stateId} with processor id ${processorId}`)
    //         executeProcessorStateRoute(stateId, processorId)
    //     }
    // }

    const onEdgeDelete = (edgeId: string) => {
        deleteProcessorStateWithWorkflowEdge(edgeId)
        // deleteProcessorState(edgeId)
    }

    const onFilterClick = (edgeId: string) => {

    }

    const onEdgePlayClick = (edgeId: string) => {
        console.log(`hello world edge id: ${edgeId}`)
        const edge = findWorkflowEdgeById(edgeId)
        if (edge) {
            const stateId = edge.source
            const processorId = edge.target

            console.log(`executing state id: ${stateId} with processor id ${processorId}`)

            const route_id = edge.id
            executeProcessorStateRoute(route_id)
            // forwardState(stateId, processorId)
        }
    }

    const onEdgeHover = (edgeId: string) => {
        console.log(`hovering over edge ${edgeId}`)

    }



    const statusColors = (status: string) => {

        if (status === "CREATED")
            return "stroke-gray-300"
        else if (status === "QUEUED")
            return "stroke-gray-600"
        else if (status === "ROUTE")
            return "stroke-yellow-500"
        else if (status === "ROUTED")
            return "stroke-amber-400"
        else if (status === "RUNNING")
            return "stroke-blue-400"
        else if (status === 'COMPLETED')
            return "stroke-green-500"
        else if (status === "FAILED")
            return "stroke-red-400"

        return "stroke-purple-100"
    }

    const statusStyles = (status: string) => {
        if (status === 'FAILED') {
            return "strokePulse 2s ease-in-out infinite"
        }
        return ""
    }

    return (<>
        <svg className="w-full h-64 border border-gray-200 rounded">
            <path id={id}
                fill="none"
                strokeWidth="2"
                d={edgePath}
                className={`
                    ${isSelected ? theme.edge.selected :
                        isHovered ? theme.edge.hover : 
                            statusColors(status)}
                `}
                onClick={() => setSelectedEdgeId(id)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    cursor: 'pointer',
                    strokeDasharray: '4',
                    animation: isStudioRefreshEnabled ?
                        `flowDash 1s linear infinite ${statusStyles(status)}` :
                        `${statusStyles(status)}`
                }}
            />
            <style>
                {`
                    @keyframes strokePulse {
                        0% { stroke-width: 1; }
                        50% { stroke-width: 4; }
                        100% { stroke-width: 1; }
                    }
                    
                    @keyframes flowDash {
                        from { stroke-dashoffset: 24; }
                        to { stroke-dashoffset: 0; }
                    }
                    @keyframes flowDash {
                      to {
                        stroke-dashoffset: -8;
                      }
                    }
                `}
            </style>
        </svg>

        {/*<path*/}
        {/*    id={id}*/}
        {/*    fill="none"*/}
        {/*    strokeWidth="2"*/}
        {/*    d={edgePath}*/}
        {/*    className={`*/}
        {/*        ${isSelected ? theme.edge.selected :*/}
        {/*        isHovered ? theme.edge.hover :*/}
        {/*            theme.edge.default}*/}
        {/*    `}*/}
        {/*    onClick={() => setSelectedEdgeId(id)}*/}
        {/*    onMouseEnter={() => setIsHovered(true)}*/}
        {/*    onMouseLeave={() => setIsHovered(false)}*/}
        {/*    style={{*/}
        {/*        cursor: 'pointer',*/}
        {/*        strokeDasharray: 4,*/}
        {/*    }}*/}
        {/*/>*/}
        <EdgeLabelRenderer>
            <div
                style={{
                    position: 'absolute',
                    transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                    pointerEvents: 'all',
                }}
                className="nodrag nopan text-xs"
            >
                <div className={`flex flex-row items-center gap-2 p-1 hover:bg-white/10 transition-all duration-200`}>
                    <div className="flex gap-1 ">
                        {getEdgeType() === "state_auto_stream_playable_edge" && (
                            <button
                                onClick={() => onEdgePlayClick(id)}
                                className="p-1.5 rounded-md bg-opacity-20 bg-green-900 text-white text-opacity-40 hover:bg-green-600 hover:text-opacity-100">
                                <FontAwesomeIcon
                                    icon={faPlay}
                                    className="w-4 h-4"
                                />
                            </button>
                        )}
                        <button
                            onClick={() => setIsOpenStateDataFilterDialog(true)}
                            className="p-1.5 rounded-md bg-opacity-20 bg-blue-900 text-white text-opacity-40 hover:bg-blue-600 hover:text-opacity-100">
                            <FontAwesomeIcon
                                icon={faFilter}
                                className="w-4 h-4"
                            />
                        </button>

                        <button
                            onClick={() => { setSelectedNodeId(null); setSelectedEdgeId(id); }}
                            className="p-1.5 rounded-md bg-opacity-20 bg-purple-900 text-white text-opacity-40 hover:bg-purple-600 hover:text-opacity-100">
                            <FontAwesomeIcon
                                icon={faBolt}
                                className="w-4 h-4"
                            />
                        </button>

                        {/* incorporates the button already */}
                        <TerminalSyslog buttonClass="p-1.5 rounded-md bg-opacity-20 bg-amber-900 text-white text-opacity-40 hover:bg-amber-600 hover:text-opacity-100" routeId={id} />

                        <button
                            onClick={() => onEdgeDelete(id)}
                            className="p-1.5 rounded-md bg-opacity-20 bg-red-900 text-white text-opacity-40 hover:bg-red-600 hover:text-opacity-100">
                            <FontAwesomeIcon
                                icon={faRemove}
                                className="w-4 h-4"
                            />
                        </button>
                    </div>
                </div>
            </div>
        </EdgeLabelRenderer>


        <TerminalStateFilterDialog
            isOpen={isOpenStateDataFilterDialog}
            onClose={() => setIsOpenStateDataFilterDialog(false)}
            filterId={id}
            direction="input"
        />
    </>);
}

export default CustomEdge