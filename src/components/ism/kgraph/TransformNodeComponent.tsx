import React, { useState } from 'react';
import type { NodeComponentProps } from '@quantumwake/kgraph';
import { useStore } from '../../../store';
import { GitBranch } from 'lucide-react';
import { TerminalDialogConfirmation } from '../../common';
import { NODE_WIDTH, NODE_HEIGHT, NODE_SIZE } from './constants';
import { renderHandles } from './renderHandles';
import { NodeToolbar } from './NodeToolbar';

export const TransformNodeComponent: React.FC<NodeComponentProps> = ({ id, data, selected }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { deleteProcessor, setSelectedNodeId } = useStore();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const nodeData = useStore(state => state.getNodeData(id)) || data || {};
    const provider = useStore(state => state.getProviderById(nodeData?.provider_id));
    const processorType = nodeData?.processor_type || data?.type || '';
    const providerName = provider?.name || '';
    const providerVersion = provider?.version || '';
    const processorName = nodeData?.name || '';

    const getDisplayType = () => {
        if (processorType.includes('coalescer')) return 'State Coalescer';
        if (processorType.includes('composite')) return 'State Composite';
        return 'Transform';
    };

    const toolbarActions = { onSettings: () => setSelectedNodeId(id), onDelete: () => setShowDeleteConfirm(true) };

    return (
        <div style={{ width: NODE_WIDTH, height: NODE_HEIGHT }}>
            <div
                className={`${NODE_SIZE} px-3 py-2 relative bg-gradient-to-br from-midnight-accent/30 via-midnight-elevated to-midnight-surface border-2 ${selected ? 'border-midnight-accent-bright shadow-midnight-glow' : 'border-midnight-border'} transition-all duration-200`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {(isHovered || selected) && <NodeToolbar nodeId={id} nodeType="transform" actions={toolbarActions} />}
                {renderHandles('#8b5cf6')}
                <div className="flex items-center gap-2 border-b border-midnight-border/50 pb-2 mb-2">
                    <GitBranch className="w-4 h-4 text-midnight-accent-bright flex-shrink-0" />
                    <span className="text-midnight-accent-bright font-semibold text-xs uppercase tracking-wide truncate">{getDisplayType()}</span>
                </div>
                <div className="space-y-0.5">
                    {providerName && <div className="text-white text-sm font-medium truncate" title={providerName}>{providerName}</div>}
                    {providerVersion && <div className="text-xs text-midnight-text-muted truncate">{providerVersion}</div>}
                    {processorName && <div className="text-xs text-midnight-accent-bright truncate" title={processorName}>{processorName}</div>}
                </div>
            </div>
            <TerminalDialogConfirmation isOpen={showDeleteConfirm} onAccept={() => { deleteProcessor(id); setShowDeleteConfirm(false); }} onCancel={() => setShowDeleteConfirm(false)} onClose={() => setShowDeleteConfirm(false)} title="Delete Transform" content="Are you sure you wish to delete this transform node?" />
        </div>
    );
};
