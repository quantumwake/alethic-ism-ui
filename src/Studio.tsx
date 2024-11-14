import React, {
    DragEvent,
    useCallback, useEffect, useState
} from 'react';

import ReactFlow, {
    Background,
    useReactFlow,
    OnConnect,
    NodeMouseHandler,
    EdgeTypes,
} from 'reactflow';

import CustomNode from './CustomNode';
import ProcessorNodeOpenAI from "./ProcessorNodeOpenAI";
import ProcessorNodeAnthropic from "./ProcessorNodeAnthropic";
import ProcessorNodeMistral from "./ProcessorNodeMistral";
import ProcessorNodePython from "./ProcessorNodePython";
import ProcessorNodeStateCoalescer from "./ProcessorNodeStateCoalescer";
import ProcessorNodeVisualOpenAI from "./ProcessorNodeVisualOpenAI";
import ProcessorNodeLLAMA from "./ProcessorNodeLlama";
import ProcessorNodeGoogleAI from "./ProcessorNodeGoogleAI";

import TrainerNode from "./TrainerNode";
import StateNode from './StateNode'
import Sidebar from './Sidebar';

import 'reactflow/dist/style.css';
import './output.css';

import Topbar from "./Topbar";
import useNodesStateSynced from "./useNodesStateSynced";
import useEdgesStateSynced from "./useEdgesStateSynced";

import useStore from './store';
import CustomConnectionLine from "./CustomConnectionLine";
import CustomEdge from "./CustomEdge";
import WithAuth from "./WithAuth";
import {faChevronLeft, faChevronRight, faDiagramProject, faFilter} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import ChannelObserver from "./DiscourseChannelSidebar";
import ConfigurationView from "./ConfigurationView";

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
    trainer: TrainerNode,
    custom: CustomNode
};

const edgeTypes: EdgeTypes = {
    default: CustomEdge,
    state_auto_stream_playable_edge: CustomEdge,
};

const proOptions = { hideAttribution: true };


const ManagementSection = () => {

    return (
        <div className="flex flex-col">
            <div className="w-full h-10 p-2 bg-black mb-0.5">
                <div className="flex flex-col items-start">
                    <div className="flex items-center justify-between w-full">
                        {/* Left-aligned buttons and dropdown */}
                        <div className="flex items-center">
                            <h1 className="flex-row flex">
                                <FontAwesomeIcon icon={faDiagramProject} className="w-5 h-5 mr-2 mt-0.5"/>
                                HELLO WORLD
                            </h1>
                        </div>

                        <div className="text-gray-600 font-bold space-x-2 ">

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Studio = () => {

    const setSelectedNode = useStore((state) => state.setSelectedNode);
    const selectedProjectId = useStore((state) => state.selectedProjectId)
    const getNode = useStore((state) => state.getNode)

    const {userId, fetchUserProfile, setUserProfile} = useStore()
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

    useEffect(() => {
        if (!userId) {
            setUserProfile(null)
            return
        }
        fetchUserProfile()
    }, [userId]);

  return (
      <div className="flex flex-col h-screen w-full">
        {/* Top Menu */}
          <Topbar callback={callback}/>
          {/*<ManagementSection />*/}

        {/* Container for Side Menu, Main Body, and Properties Menu */}
          <div className="flex ml-2 overflow-hidden">
              {/* Side Menu */}
              <Sidebar/>

              {/* Main Body Area - for React Flow */}
              <div className="flex-grow p-2 h-full">
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
                      edgeTypes={edgeTypes}
                      nodeTypes={nodeTypes}>
                      <Background color="#aaa" gap={12}/>
                  </ReactFlow>

                  <button
                      onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                      className="absolute top-2 z-0 right-0 h-10 text-xs text-white bg-orange-400 p-2 rounded-none shadow-lg">
                      {isRightSidebarOpen ?
                          <FontAwesomeIcon className="h-6 w-3" icon={faChevronLeft}/> :
                          <FontAwesomeIcon className="h-6 w-3" icon={faChevronRight}/>}
                  </button>
                  {/*<button*/}
                  {/*    onClick={() => setIsConfigViewOpen(!isConfigViewOpen)}*/}
                  {/*    className="absolute top-2 z-0 right-0 h-10 text-xs text-white bg-orange-400 p-2 rounded-none shadow-lg">*/}
                  {/*    {isConfigViewOpen ?*/}
                  {/*        <FontAwesomeIcon className="h-6 w-3" icon={faChevronLeft}/> :*/}
                  {/*        <FontAwesomeIcon className="h-6 w-3" icon={faChevronRight}/>}*/}
                  {/*</button>*/}
              </div>
              <div
                  className={`w-[350pt] h-full p-0 m-0 border-2 border-green-400 transition-all duration-300 ${isRightSidebarOpen ? 'hidden' : ''}`}>
                  <ChannelObserver/>
              </div>
              {/*<div*/}
              {/*    className={`w-[350pt] h-full p-0 m-0 border-2 border-green-400 transition-all duration-300 ${isConfigViewOpen ? 'hidden' : ''}`}>*/}
              {/*    <ConfigurationView/>*/}
              {/*</div>*/}
          </div>
      </div>
  );
};

export default WithAuth(Studio)
