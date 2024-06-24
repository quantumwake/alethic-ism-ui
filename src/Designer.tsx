import React, {
    DragEvent,
    useCallback
} from 'react';

import ReactFlow, {
    Background,
    useReactFlow,
    OnConnect,
    NodeMouseHandler,
    EdgeTypes, ReactFlowProvider,
} from 'reactflow';

import CustomNode from './CustomNode';
import ProcessorNodeOpenAI from "./ProcessorNodeOpenAI";
import ProcessorNodeAnthropic from "./ProcessorNodeAnthropic";
import ProcessorNodeLlama from "./ProcessorNodeLlama";
import ProcessorNodeMistral from "./ProcessorNodeMistral";
import ProcessorNodePython from "./ProcessorNodePython";
import ProcessorNodeGemini from "./ProcessorNodeGemini";
import ProcessorNodeEvaluatorEvaluator from "./ProcessorNodeAlethicEvalautor";
import StateNode from './StateNode'
import Sidebar from './Sidebar';

import 'reactflow/dist/style.css';
import './output.css';

import Topbar from "./Topbar";
import useNodesStateSynced from "./useNodesStateSynced";
import useEdgesStateSynced from "./useEdgesStateSynced";

import useStore from './store';
import ProcessorNodeStateCoalescer from "./ProcessorNodeStateCoalescer";
import CustomConnectionLine from "./CustomConnectionLine";
import CustomEdge from "./CustomEdge";
import WorkflowDownload from "./WorkflowDownload";
import WithAuth from "./WithAuth";

const nodeTypes = {
    state: StateNode,
    processor_python: ProcessorNodePython,
    processor_openai: ProcessorNodeOpenAI,
    processor_gemini: ProcessorNodeGemini,
    processor_anthropic: ProcessorNodeAnthropic,
    processor_llama: ProcessorNodeLlama,
    processor_mistral: ProcessorNodeMistral,
    processor_alethic_evaluator: ProcessorNodeEvaluatorEvaluator,
    processor_state_coalescer: ProcessorNodeStateCoalescer,
    custom: CustomNode
};

const edgeTypes: EdgeTypes = {
    default: CustomEdge,
    state_auto_stream_playable_edge: CustomEdge,
    // 'start-end': CustomEdgeStartEnd,
};

const proOptions = { hideAttribution: true };

const Designer = () => {

    const setSelectedNode = useStore((state) => state.setSelectedNode);
    // const createNewNode = useStore((state) => state.createNewNode)
    // const createNewEdge = useStore((state) => state.createNewEdge)
    const selectedProjectId = useStore((state) => state.selectedProjectId)
    const getNode = useStore((state) => state.getNode)

    const createStateWithWorkflowNode = useStore(state => state.createStateWithWorkflowNode)
    const createProcessorWithWorkflowNode = useStore(state => state.createProcessorWithWorkflowNode)
    const createProcessorStateWithWorkflowEdge = useStore(state => state.createProcessorStateWithWorkflowEdge)
    // const createProcessorState = useStore((state) => state.createProcessorState)

    const {workflowEdges, setWorkflowEdges, workflowNodes, setWorkflowNodes} = useStore(state => ({
        workflowEdges: state.workflowEdges,
        setWorkflowEdges: state.setWorkflowEdges,
        workflowNodes: state.workflowNodes,
        setWorkflowNodes: state.setWorkflowNodes,
    }));

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
        } else {
            throw new Error('unsupported module type')
        }


    };

    const onDragOver = (event: DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };

  return (
      <div className="flex flex-col h-screen w-full">
        {/* Top Menu */}
          <Topbar/>

        {/* Container for Side Menu, Main Body, and Properties Menu */}
          <div className="flex ml-2 mt-2 overflow-hidden">
              {/* Side Menu */}
              <Sidebar/>

              {/* Main Body Area - for React Flow */}
              <div className="flex-grow p-2 overflow-auto">
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

                  {/*<Controls />*/}
                  {/*<Background gap={25} />*/}
                  {/*<WorkflowDownload />*/}
              </div>

              {/* Right-most Properties Menu (Expandable/Collapsible) */}
              {/*<div className="w-64 h-full bg-stone-50 shadow-lg p-0">*/}
              {/*  <Properties/>*/}
              {/*</div>*/}
          </div>
      </div>


  );
};

export default WithAuth(Designer)
