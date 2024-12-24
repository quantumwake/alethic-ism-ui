import React, {useEffect, useState} from 'react';
import useStore from "../store";
import {faFilter, faPlay, faRemove} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import StateDataFilterDialog from "../archive/StateDataFilterDialog";
import {EdgeLabelRenderer, EdgeProps, getBezierPath} from "@xyflow/react";

function CustomEdge({   id, sourceX, sourceY, targetX, targetY,
                                                        sourcePosition, targetPosition,
                                                        style = {}, markerStart,
                                                        markerEnd}: EdgeProps) {


    const [isHovered, setIsHovered] = useState(false);
    const [edge, setEdge] = useState()
    const [status, setStatus] = useState('')
    const processorStates = useStore(state => state.processorStates)
    const {workflowEdges, findWorkflowEdgeById, deleteProcessorStateWithWorkflowEdge, executeProcessorStateRoute} = useStore()
    const {selectedEdgeId, setSelectedEdgeId} = useStore()
    const isSelected = selectedEdgeId === id;
    const [isOpenStateDataFilterDialog, setIsOpenStateDataFilterDialog] = useState(false);

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
            return "bg-gray-50"
        else if (status === "QUEUED")
            return "bg-yellow-50"
        else if (status === "ROUTE")
            return "bg-yellow-100"
        else if (status === "ROUTED")
            return "bg-yellow-200"
        else if (status === "RUNNING")
            return "bg-blue-100"
        else if (status === 'COMPLETED')
            return "bg-green-50"
        else if (status === "FAILED")
            return "bg-red-100"

        return "bg-purple-100"
    }

    // let status_2 = "RUNNING"
    // const t = statusColors(status_2)
    const theme = useStore(state => state.getCurrentTheme());


    return (<>
        <svg className="w-full h-64 border border-gray-200 rounded">
            <path id={id}
                fill="none"
                strokeWidth="2"
                d={edgePath}
                className={`
          ${isSelected ? theme.edge.selected :
                    isHovered ? theme.edge.hover :
                        theme.edge.default}
          animate-dash
        `}
                onClick={() => setSelectedEdgeId(id)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    cursor: 'pointer',
                    strokeDasharray: '4',
                    animation: 'flowDash 1s linear infinite'
                }}
            />
            <style>{`
        @keyframes flowDash {
          to {
            stroke-dashoffset: -8;
          }
        }
        .animate-dash {
          animation: flowDash 1s linear infinite;
        }
      `}</style>
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
                className={`nodrag nopan ${theme.textSize.xs}`}
            >
                <div className={`flex flex-row ${theme.spacing.xs} ${theme.edge.label.container}`}>
                    <div className={`
                        ${statusColors(status)} 
                        ${theme.spacing.xs} 
                        ${theme.border} 
                        ${theme.edge.label.status}
                    `}>
                        {status}
                    </div>

                    {getEdgeType() === "state_auto_stream_playable_edge" && (
                        <button
                            onClick={() => onEdgePlayClick(id)}
                            className={`
                                ml-0.5 
                                ${theme.spacing.xs} 
                                ${theme.button.success} 
                                ${theme.edge.label.button}
                            `}>
                            <FontAwesomeIcon
                                icon={faPlay}
                                className={theme.default.icon.size.sm}
                            />
                        </button>
                    )}

                    <button
                        onClick={() => setIsOpenStateDataFilterDialog(true)}
                        className={`
                            ml-0.5 
                            ${theme.spacing.xs} 
                            ${theme.button.secondary} 
                            ${theme.edge.label.button}
                        `}>
                        <FontAwesomeIcon
                            icon={faFilter}
                            className={theme.default.icon.size.sm}
                        />
                    </button>

                    <button
                        onClick={() => onEdgeDelete(id)}
                        className={`
                            ml-0.5 
                            ${theme.spacing.xs} 
                            ${theme.button.danger} 
                            ${theme.edge.label.button}
                        `}>
                        <FontAwesomeIcon
                            icon={faRemove}
                            className={theme.default.icon.size.sm}
                        />
                    </button>
                </div>
            </div>
        </EdgeLabelRenderer>

        <StateDataFilterDialog
            isOpen={isOpenStateDataFilterDialog}
            setIsOpen={setIsOpenStateDataFilterDialog}
            filterId={id}
        />
    </>);
}

export default CustomEdge