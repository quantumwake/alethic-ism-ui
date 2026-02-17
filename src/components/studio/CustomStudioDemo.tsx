import React, { useState } from 'react';
import { CustomStudioWrapper, DiagramNode, DiagramEdge } from './index';
import { useStore } from '../../store';
import { Box, Circle, Diamond, Hexagon } from 'lucide-react';

/**
 * Demo component showcasing CustomStudio capabilities
 */

// Custom Node Components
const ProcessNode: React.FC<{ data: any; selected: boolean }> = ({ data, selected }) => {
    return (
        <div className={`
            px-4 py-3 rounded-lg min-w-[140px]
            bg-gradient-to-r from-midnight-info/30 to-midnight-elevated
            border-2 ${selected ? 'border-midnight-info-bright shadow-midnight-info' : 'border-midnight-border'}
            transition-all duration-200
        `}>
            <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-midnight-info-bright" />
                <span className="text-white font-medium text-sm">{data.label}</span>
            </div>
            {data.description && (
                <div className="text-xs text-midnight-text-muted mt-1">{data.description}</div>
            )}
        </div>
    );
};

const DataNode: React.FC<{ data: any; selected: boolean }> = ({ data, selected }) => {
    return (
        <div className={`
            px-4 py-3 rounded-lg min-w-[140px]
            bg-gradient-to-r from-midnight-success/30 to-midnight-elevated
            border-2 ${selected ? 'border-midnight-success-bright shadow-midnight-success' : 'border-midnight-border'}
            transition-all duration-200
        `}>
            <div className="flex items-center gap-2">
                <Circle className="w-4 h-4 text-midnight-success-bright" />
                <span className="text-white font-medium text-sm">{data.label}</span>
            </div>
            {data.count !== undefined && (
                <div className="text-xs text-midnight-success-bright mt-1">{data.count} items</div>
            )}
        </div>
    );
};

const DecisionNode: React.FC<{ data: any; selected: boolean }> = ({ data, selected }) => {
    return (
        <div className={`
            px-4 py-3 min-w-[120px]
            bg-gradient-to-r from-midnight-warning/30 to-midnight-elevated
            border-2 ${selected ? 'border-midnight-warning-bright' : 'border-midnight-border'}
            transition-all duration-200
            transform rotate-0
        `} style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}>
            <div className="flex flex-col items-center justify-center py-2">
                <Diamond className="w-4 h-4 text-midnight-warning-bright" />
                <span className="text-white font-medium text-xs mt-1">{data.label}</span>
            </div>
        </div>
    );
};

const ActionNode: React.FC<{ data: any; selected: boolean }> = ({ data, selected }) => {
    return (
        <div className={`
            px-4 py-3 rounded-lg min-w-[140px]
            bg-gradient-to-r from-midnight-accent/30 to-midnight-elevated
            border-2 ${selected ? 'border-midnight-accent-bright shadow-midnight-glow' : 'border-midnight-border'}
            transition-all duration-200
        `}>
            <div className="flex items-center gap-2">
                <Hexagon className="w-4 h-4 text-midnight-accent-bright" />
                <span className="text-white font-medium text-sm">{data.label}</span>
            </div>
        </div>
    );
};

// Draggable palette item
const PaletteItem: React.FC<{
    type: string;
    label: string;
    icon: React.ReactNode;
    color: string;
}> = ({ type, label, icon, color }) => {
    const onDragStart = (event: React.DragEvent) => {
        event.dataTransfer.setData('application/reactflow', type);
        event.dataTransfer.setData('application/label', label);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div
            draggable
            onDragStart={onDragStart}
            className={`
                flex items-center gap-2 px-3 py-2 rounded-md cursor-grab
                bg-midnight-surface hover:bg-midnight-elevated
                border border-midnight-border hover:border-${color}
                transition-all duration-200
            `}
        >
            {icon}
            <span className="text-sm text-midnight-text-body">{label}</span>
        </div>
    );
};

// Main Demo Component
const CustomStudioDemo: React.FC = () => {
    const theme = useStore((state: any) => state.getCurrentTheme());

    const [nodes, setNodes] = useState<DiagramNode[]>([
        {
            id: 'data-1',
            type: 'data',
            position: { x: 100, y: 100 },
            data: { label: 'Input Data', count: 1250 },
        },
        {
            id: 'process-1',
            type: 'process',
            position: { x: 350, y: 100 },
            data: { label: 'Transform', description: 'Clean & validate' },
        },
        {
            id: 'decision-1',
            type: 'decision',
            position: { x: 600, y: 100 },
            data: { label: 'Valid?' },
        },
        {
            id: 'action-1',
            type: 'action',
            position: { x: 800, y: 50 },
            data: { label: 'Process' },
        },
        {
            id: 'action-2',
            type: 'action',
            position: { x: 800, y: 180 },
            data: { label: 'Reject' },
        },
    ]);

    const [edges, setEdges] = useState<DiagramEdge[]>([
        { id: 'e1', source: 'data-1', target: 'process-1' },
        { id: 'e2', source: 'process-1', target: 'decision-1' },
        { id: 'e3', source: 'decision-1', target: 'action-1' },
        { id: 'e4', source: 'decision-1', target: 'action-2' },
    ]);

    const nodeTypes = {
        process: ProcessNode,
        data: DataNode,
        decision: DecisionNode,
        action: ActionNode,
    };

    return (
        <div className="flex h-screen bg-midnight-base">
            {/* Left Palette */}
            <div className={`
                w-64 p-4 border-r border-midnight-border
                bg-midnight-surface flex flex-col gap-4
            `}>
                <h3 className="text-midnight-text-label text-xs uppercase tracking-wider font-medium">
                    Components
                </h3>

                <div className="flex flex-col gap-2">
                    <PaletteItem
                        type="data"
                        label="Data Node"
                        icon={<Circle className="w-4 h-4 text-midnight-success-bright" />}
                        color="midnight-success"
                    />
                    <PaletteItem
                        type="process"
                        label="Process Node"
                        icon={<Box className="w-4 h-4 text-midnight-info-bright" />}
                        color="midnight-info"
                    />
                    <PaletteItem
                        type="decision"
                        label="Decision Node"
                        icon={<Diamond className="w-4 h-4 text-midnight-warning-bright" />}
                        color="midnight-warning"
                    />
                    <PaletteItem
                        type="action"
                        label="Action Node"
                        icon={<Hexagon className="w-4 h-4 text-midnight-accent-bright" />}
                        color="midnight-accent"
                    />
                </div>

                <div className="mt-auto text-xs text-midnight-text-subdued">
                    <p>Drag components to canvas</p>
                    <p className="mt-1">Connect nodes by dragging from handles</p>
                    <p className="mt-1">Press Backspace to delete selected</p>
                </div>
            </div>

            {/* Main Canvas */}
            <div className="flex-1">
                <CustomStudioWrapper
                    initialNodes={nodes}
                    initialEdges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={(updatedNodes) => {
                        console.log('Nodes changed:', updatedNodes);
                    }}
                    onEdgesChange={(updatedEdges) => {
                        console.log('Edges changed:', updatedEdges);
                    }}
                    onNodeCreate={(node) => {
                        console.log('Node created:', node);
                    }}
                    onNodeDelete={(id) => {
                        console.log('Node deleted:', id);
                    }}
                    onEdgeCreate={(edge) => {
                        console.log('Edge created:', edge);
                    }}
                    onEdgeDelete={(id) => {
                        console.log('Edge deleted:', id);
                    }}
                    showMiniMap={true}
                    showToolbar={true}
                    snapToGrid={true}
                    backgroundGap={32}
                />
            </div>
        </div>
    );
};

export default CustomStudioDemo;
