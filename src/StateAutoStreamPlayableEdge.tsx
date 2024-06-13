import React, {useEffect, useState} from 'react';
import {
    BaseEdge,
    EdgeLabelRenderer,
    EdgeProps,
    getBezierPath,
    useReactFlow,
} from 'reactflow';

import {PlayPauseIcon} from "@heroicons/react/24/outline";
import useStore from "./store";

export default function StateAutoStreamPlayableEdge({   id, sourceX, sourceY, targetX, targetY,
                                                        sourcePosition, targetPosition,
                                                        style = {}, markerStart,
                                                        markerEnd}: EdgeProps) {


    const [edge, setEdge] = useState()
    const [status, setStatus] = useState()
    const processorStates = useStore(state => state.processorStates)
    const {workflowEdges, findWorkflowEdgeById, forwardState} = useStore()

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

    const onEdgeClick = (edgeId: string) => {
        console.log(`hello world edge id: ${edgeId}`)
        const edge = findWorkflowEdgeById(edgeId)
        if (edge) {

            const stateId = edge.source
            const processorId = edge.target

            console.log(`executing state id: ${stateId} with processor id ${processorId}`)

            forwardState(stateId, processorId)
        }
    };

    const onEdgeHover = (edgeId: string) => {
        console.log(`hovering over edge ${edgeId}`)

    }

    return (
        <>
            {/*<BaseEdge path={edgePath} markerEnd={markerEnd} style={style}/>*/}
            <path
                id={id}
                fill="none"
                stroke="red"
                strokeWidth="2.0"
                className="animated"
                d={edgePath}
                markerEnd={markerEnd}
            />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        fontSize: 12,
                        // everything inside EdgeLabelRenderer has no pointer events by default
                        // if you have an interactive element, set pointer-events: all
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan"
                >
                    <div className="flex flex-row">
                        <div className="p-1 border-black shadow-md shadow-gray-200 align-middle bg-stone-50 text-gray-700">
                            {status}
                        </div>

                        {getEdgeType() === "default" && (
                            <button
                                onClick={() => onEdgeClick(id)}
                                className="ml-1 px-1.5 py-0.5 bg-emerald-500 text-white rounded-sm hover:bg-emerald-200 focus:outline-none">
                                <PlayPauseIcon className="h-6 w-4"/>
                            </button>
                        )}
                    </div>
                </div>
            </EdgeLabelRenderer>
        </>
    );
}
