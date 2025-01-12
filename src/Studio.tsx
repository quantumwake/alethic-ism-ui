import './output.css';
import React, {DragEvent, ReactElement, useCallback, useState} from 'react';
import '@xyflow/react/dist/style.css';

import {Background, EdgeTypes, NodeMouseHandler, OnConnect, ReactFlow, useReactFlow} from '@xyflow/react';
import ProcessorNodeOpenAI from "./nodes/ProcessorNodeOpenAI";
import ProcessorNodeAnthropic from "./nodes/ProcessorNodeAnthropic";
import ProcessorNodeMistral from "./nodes/ProcessorNodeMistral";
import ProcessorNodePython from "./nodes/ProcessorNodePython";
import ProcessorNodeStateCoalescer from "./nodes/ProcessorNodeStateCoalescer";
import ProcessorNodeVisualOpenAI from "./nodes/ProcessorNodeVisualOpenAI";
import ProcessorNodeLLAMA from "./nodes/ProcessorNodeLlama";
import ProcessorNodeGoogleAI from "./nodes/ProcessorNodeGoogleAI";
import ProcessorNodeSQL from "./nodes/ProcessorNodeDatabase";
import TrainerNode from "./nodes/TrainerNode";
import StateNode from './nodes/StateNode'

import {useStore} from "./store";

import useNodesStateSynced from "./useNodesStateSynced";
import useEdgesStateSynced from "./useEdgesStateSynced";
import CustomConnectionLine from "./reactflow/CustomConnectionLine";
import CustomEdge from "./reactflow/CustomEdge";
import WithAuth from "./WithAuth";
import {TerminalButton} from "./components/common";

import {BugIcon, RefreshCcwIcon, SaveIcon, Trash2Icon} from "lucide-react";

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
    trainer: TrainerNode,
};

const edgeTypes: EdgeTypes = {
    default: CustomEdge,
    state_auto_stream_playable_edge: CustomEdge,
};

const proOptions = { hideAttribution: true };

const Studio = () => {
    // const theme = useStore((state: any) => state.getCurrentTheme().getCurrentTheme());
    const {selectedProjectId, setSelectedNode, getNode} = useStore()
    const {workflowEdges, createStateWithWorkflowNode, createTrainerWithWorkflowNode, createProcessorWithWorkflowNode, createProcessorStateWithWorkflowEdge} = useStore()

    const [isConfigViewOpen, setIsConfigViewOpen] = useState(false)
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
    const [nodes, setNodes, onNodesChange] = useNodesStateSynced();
    const [edges, setEdges, onEdgesChange] = useEdgesStateSynced();
    const {screenToFlowPosition} = useReactFlow();


    const onInit = () => console.log('flow loaded:');


    // TODO ? We are adding a blink effect on click that we remove after 3000ms again.
    // This should help users to see that a node was clicked by another user.
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

    const saveRefreshClicked = async() => {
        console.log("hello world")
    }

  return (
      <div className="relative flex-grow h-screen bg-[#1e1e1e] flex w-full">

          <div className="z-50 absolute top-2 right-6 flex gap-4">
              <TerminalButton onClick={saveRefreshClicked} variant="primary">
                  <RefreshCcwIcon className="w-4 h-h" />
              </TerminalButton>
          </div>

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
                  color="white"
                  edgeTypes={edgeTypes}
                  nodeTypes={nodeTypes}>
                  <Background color="#ffffff" gap={32}/>
              </ReactFlow>
          )}
      </div>
  );
};

export default WithAuth(Studio)
