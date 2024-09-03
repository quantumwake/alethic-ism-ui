import React, {useEffect, useState} from 'react';
import {
    BaseEdge,
    EdgeLabelRenderer,
    EdgeProps,
    getBezierPath,
    useReactFlow,
} from 'reactflow';

import useStore from "./store";
import {faFilter, faPlay, faRemove} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import StateDataFilterDialog from "./StateDataFilterDialog";

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
    const arrowId = `arrow-${id}`;

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


    return (<>
        {/* Path to handle hover and click events */}
        <path
            id={id}
            fill="none"
            strokeWidth="2"
            d={edgePath}
            className={`${
                isSelected ? 'stroke-red-700' :
                    isHovered ? 'stroke-gray-800' :
                        'stroke-blue-300'
            }`}
            onClick={() => setSelectedEdgeId(id)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                cursor: 'pointer',
                strokeDasharray: 4,
            }}
        />
        <EdgeLabelRenderer>
            <div
                style={{
                    position: 'absolute',
                    transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                    fontSize: 8,
                    // everything inside EdgeLabelRenderer has no pointer events by default
                    // if you have an interactive element, set pointer-events: all
                    pointerEvents: 'all',
                }}
                className="nodrag nopan"
            >
                <div className="flex flex-row p-0.5 bg-blue-100 border-black rounded-sm">
                    <div
                        className={statusColors(status) + " p-0.5 border-black align-middle text-gray-700"}>
                        {status}
                    </div>

                    {getEdgeType() === "state_auto_stream_playable_edge" && (
                        <button
                            onClick={() => onEdgePlayClick(id)}
                            className="ml-0.5 px-1.5 py-0.5 bg-emerald-500 text-white rounded-sm hover:bg-emerald-200 focus:outline-none">
                            <FontAwesomeIcon icon={faPlay}/>
                        </button>
                    )}
                    {/*{getEdgeType() === "state_auto_stream_playable_edge" && (*/}
                    <button
                        onClick={() => setIsOpenStateDataFilterDialog(true)}
                        className="ml-0.5 px-1.5 py-0.5 bg-emerald-500 text-white rounded-sm hover:bg-emerald-200 focus:outline-none">
                        <FontAwesomeIcon icon={faFilter}/>
                    </button>
                    {/*)}*/}

                    <button
                        onClick={() => onEdgeDelete(id)}
                        // onClick={() => onEdgeDelete(id)}
                        className="ml-0.5 px-1.5 py-0.5 bg-red-500 text-white rounded-sm hover:bg-pink-700 focus:outline-none">
                        <FontAwesomeIcon icon={faRemove}/>
                    </button>
                </div>
            </div>
        </EdgeLabelRenderer>

        <StateDataFilterDialog isOpen={isOpenStateDataFilterDialog} setIsOpen={setIsOpenStateDataFilterDialog}
                               filterId={id}/>
    </>);
}

export default CustomEdge