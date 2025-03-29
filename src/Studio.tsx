import './output.css';
import React, {DragEvent, useCallback, useEffect, useRef, useState} from 'react';
import '@xyflow/react/dist/style.css';

import {Background, EdgeTypes, NodeMouseHandler, OnConnect, ReactFlow, useReactFlow} from '@xyflow/react';
import {
    ProcessorNodeOpenAI,
    ProcessorNodeAnthropic,
    ProcessorNodeMistral,
    ProcessorNodePython,
    ProcessorNodeTransformCoalescer,
    ProcessorNodeTransformComposite,
    ProcessorNodeVisualOpenAI,
    ProcessorNodeLlama,
    ProcessorNodeGoogleAI,
    ProcessorNodeProvider,
    TrainerNode,
    StateNode,
    /// rename these, need better naming convention around the function runtime?
    FunctionNodeDataSourceSQL,
    FunctionNodeUserInteraction
} from "./nodes";

import {useStore} from "./store";

import useNodesStateSynced from "./useNodesStateSynced";
import useEdgesStateSynced from "./useEdgesStateSynced";
import CustomConnectionLine from "./reactflow/CustomConnectionLine";
import CustomEdge from "./reactflow/CustomEdge";
import WithAuth from "./WithAuth";
import {TerminalButton} from "./components/common";

import {BugOffIcon, RefreshCcwIcon} from "lucide-react";
import TerminalStreamDebug from "./components/ism/TerminalStreamDebug";

const nodeTypes = {
    state: StateNode,
    processor_python: ProcessorNodePython,
    processor_openai: ProcessorNodeOpenAI,
    processor_visual_openai: ProcessorNodeVisualOpenAI,
    processor_google_ai: ProcessorNodeGoogleAI,
    processor_anthropic: ProcessorNodeAnthropic,
    processor_llama: ProcessorNodeLlama,
    processor_mistral: ProcessorNodeMistral,
    processor_state_coalescer: ProcessorNodeTransformCoalescer,
    processor_state_composite: ProcessorNodeTransformComposite,
    processor_provider: ProcessorNodeProvider,
    trainer: TrainerNode,
    function_datasource_sql: FunctionNodeDataSourceSQL,
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
    const {userUsageReport, fetchProjectProcessorStates, fetchUsageReportGroupByUser} = useStore()
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

        if (type.startsWith('processor') || type.startsWith('function')) {
            await createProcessorWithWorkflowNode(nodeData)
        } else if (type.startsWith('state')) {
            await createStateWithWorkflowNode(nodeData)
        } else if (type.startsWith('trainer')) {
            await createTrainerWithWorkflowNode(nodeData)
        } else {
            throw new Error('unsupported module type')
        }
    };

    const onDragOver = (event: DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };

    const {isStudioRefreshEnabled, setStudioIsRefreshEnabled} = useStore()
    const [isStreamDebugOpen, setIsStreamDebugOpen] = useState(false);

    const toggleDebugChannelClicked = () => {
        setIsStreamDebugOpen((prev) => !prev);
    };

    const toggleRefreshClicked = async() => {
        const isRefreshingLast = isStudioRefreshEnabled
        const isRefreshingUpdate = !isRefreshingLast
        setStudioIsRefreshEnabled(isRefreshingUpdate);
        console.log(`updated auto-refresh flag from: ${isRefreshingLast}, to: ${isRefreshingUpdate}`)

    }
    const timeoutIdRef = useRef<string | number | NodeJS.Timeout>()

    const refreshStudio = useCallback(() => {
        if (!isStudioRefreshEnabled) {
            clearTimeout(timeoutIdRef.current)
            return
        }

        console.info('refreshing processor states store, this includes workflow node and edge status information')
        fetchProjectProcessorStates()
        timeoutIdRef.current = setTimeout(refreshStudio, 2000)
    }, [isStudioRefreshEnabled])


    useEffect(() => {
        refreshStudio()
    }, [isStudioRefreshEnabled, setStudioIsRefreshEnabled])

  return (
      <div className="relative flex-grow h-screen bg-[#1e1e1e] flex w-full">

          <div className="z-50 absolute top-2 right-6 flex gap-4">
              <TerminalButton onClick={toggleRefreshClicked} variant="primary">
                  <RefreshCcwIcon className="w-4 h-h"/>
              </TerminalButton>

              <TerminalButton onClick={toggleDebugChannelClicked} variant="primary">
                  <BugOffIcon className="w-4 h-h"/>
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

          {/* Channel Debugger Floating Dialog */}
          {isStreamDebugOpen && ( // Conditionally render based on state
              // <div className="z-40 absolute inset-0 flex justify-center items-center bg-black bg-opacity-50">
              //     <div className="bg-white p-4 rounded shadow-lg">
                      <TerminalStreamDebug />
                  // </div>
              // </div>
          )}
      </div>
  );
};

export default WithAuth(Studio)
