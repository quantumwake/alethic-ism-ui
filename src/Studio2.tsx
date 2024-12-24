import React, {
    DragEvent,
    useCallback, useEffect, useState
} from 'react';

import {Background, EdgeTypes, NodeMouseHandler, OnConnect, ReactFlow, useReactFlow} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CustomNode from './archive/CustomNode';
import ProcessorNodeOpenAI from "./nodes/ProcessorNodeOpenAI";
import ProcessorNodeAnthropic from "./nodes/ProcessorNodeAnthropic";
import ProcessorNodeMistral from "./nodes/ProcessorNodeMistral";
import ProcessorNodePython from "./nodes/ProcessorNodePython";
import ProcessorNodeStateCoalescer from "./nodes/ProcessorNodeStateCoalescer";
import ProcessorNodeVisualOpenAI from "./nodes/ProcessorNodeVisualOpenAI";
import ProcessorNodeLLAMA from "./nodes/ProcessorNodeLlama";
import ProcessorNodeGoogleAI from "./nodes/ProcessorNodeGoogleAI";
import TrainerNode from "./nodes/TrainerNode";
import StateNode from './nodes/StateNode'

import './output.css';

import useNodesStateSynced from "./useNodesStateSynced";
import useEdgesStateSynced from "./useEdgesStateSynced";

import useStore from './store';
import CustomConnectionLine from "./reactflow/CustomConnectionLine";
import CustomEdge from "./reactflow/CustomEdge";
import WithAuth from "./WithAuth";

import ProcessorNodeSQL from "./nodes/ProcessorNodeDatabase";

const nodeTypes = {
    state: StateNode,
    processor_python: ProcessorNodePython,
    processor_openai: ProcessorNodeOpenAI,
    processor_visual_openai: ProcessorNodeVisualOpenAI,
    processor_google_ai: ProcessorNodeGoogleAI,
    processor_anthropic: ProcessorNodeAnthropic,
    processor_llama: ProcessorNodeLLAMA,
    processor_mistral: ProcessorNodeMistral,
    processor_state_coalescer: ProcessorNodeStateCoalescer,
    processor_datasource_sql: ProcessorNodeSQL,
    // processor_user_input: FunctionNodeUserInteraction,
    trainer: TrainerNode,
    custom: CustomNode
};

const edgeTypes: EdgeTypes = {
    default: CustomEdge,
    state_auto_stream_playable_edge: CustomEdge,
};

const proOptions = { hideAttribution: true };

const Studio2 = () => {
    const theme = useStore(state => state.getCurrentTheme());

    const setSelectedNode = useStore((state) => state.setSelectedNode);
    const selectedProjectId = useStore((state) => state.selectedProjectId)
    const getNode = useStore((state) => state.getNode)

    const createStateWithWorkflowNode = useStore(state => state.createStateWithWorkflowNode)
    const createTrainerWithWorkflowNode = useStore(state => state.createTrainerWithWorkflowNode)
    const createProcessorWithWorkflowNode = useStore(state => state.createProcessorWithWorkflowNode)
    const createProcessorStateWithWorkflowEdge = useStore(state => state.createProcessorStateWithWorkflowEdge)

    const {workflowEdges, setWorkflowEdges, workflowNodes, setWorkflowNodes} = useStore(state => ({
        workflowEdges: state.workflowEdges,
        setWorkflowEdges: state.setWorkflowEdges,
        workflowNodes: state.workflowNodes,
        setWorkflowNodes: state.setWorkflowNodes,
    }));

    const [isConfigViewOpen, setIsConfigViewOpen] = useState(false)
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
    const [nodes, setNodes, onNodesChange] = useNodesStateSynced();
    const [edges, setEdges, onEdgesChange] = useEdgesStateSynced();
    const {screenToFlowPosition} = useReactFlow();


    const onInit = () => console.log('flow loaded:');


    // // // We are adding a blink effect on click that we remove after 3000ms again.
    // // // This should help users to see that a node was clicked by another user.
    const onNodeClick: NodeMouseHandler = useCallback(
        (_, node) => {
            console.debug(node)
            setSelectedNode(node);
        },
        [setNodes]
    );

    const onConnect: OnConnect = useCallback(
        (connection) => {
            createProcessorStateWithWorkflowEdge(connection)
        },
        [workflowEdges, setEdges, getNode]
    );

    const toggleRightSidebar = () => {
        setIsRightSidebarOpen(!isRightSidebarOpen);
    };


    const onDrop = async (event: DragEvent) => {
        event.preventDefault();

        const type = event.dataTransfer.getData('application/reactflow');
        const position = screenToFlowPosition({
            x: event.clientX - 80,
            y: event.clientY - 20,
        });

        const nodeData = {
            node_type: type,
            node_label: type,
            project_id: selectedProjectId,
            position_x: position.x,
            position_y: position.y,
            width: 100,
            height: 100
        }

        if (type.startsWith('processor')) {
            createProcessorWithWorkflowNode(nodeData)
        } else if (type.startsWith('state')) {
            createStateWithWorkflowNode(nodeData)
        } else if (type.startsWith('trainer')) {
            createTrainerWithWorkflowNode(nodeData)
        } else {
            throw new Error('unsupported module type')
        }
    };

    const onDragOver = (event: DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };

    const callback = (value: any) => {
        console.log(value)
    }

  return (
      <div className="flex-grow h-screen">
          {selectedProjectId !== null && (
          <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodeClick={onNodeClick}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={onInit}
              onDrop={onDrop}
              onDragOver={onDragOver}
              fitView
              attributionPosition="top-right"
              connectionLineComponent={CustomConnectionLine}
              proOptions={proOptions}
              color="black"
              edgeTypes={edgeTypes}
              nodeTypes={nodeTypes}>
              <Background color="#abab" gap={12}/>
          </ReactFlow>
          )}
      </div>
  );
};

export default WithAuth(Studio2)
