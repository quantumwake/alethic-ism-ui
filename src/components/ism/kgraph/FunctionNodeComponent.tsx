import React, { useState } from 'react';
import type { NodeComponentProps } from '../../../kgraph';
import { useStore } from '../../../store';
import { Hexagon } from 'lucide-react';
import { TerminalDialogConfirmation } from '../../common';
import { NODE_WIDTH, NODE_HEIGHT, NODE_SIZE } from './constants';
import { renderHandles } from './renderHandles';
import { NodeToolbar } from './NodeToolbar';

export const FunctionNodeComponent: React.FC<NodeComponentProps> = ({ id, data, selected }) => {
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
        if (processorType.includes('sql')) return 'SQL Query';
        if (processorType.includes('datasource')) return 'Data Source';
        return 'Function';
    };

    const toolbarActions = { onSettings: () => setSelectedNodeId(id), onDelete: () => setShowDeleteConfirm(true) };

    return (
        <div style={{ width: NODE_WIDTH, height: NODE_HEIGHT }}>
            <div
                className={`${NODE_SIZE} px-3 py-2 relative bg-gradient-to-br from-midnight-warning/30 via-midnight-elevated to-midnight-surface border-2 ${selected ? 'border-midnight-warning-bright shadow-midnight-glow' : 'border-midnight-border'} transition-all duration-200`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {(isHovered || selected) && <NodeToolbar nodeId={id} nodeType="function" actions={toolbarActions} />}
                {renderHandles('#f59e0b')}
                <div className="flex items-center gap-2 border-b border-midnight-border/50 pb-2 mb-2">
                    <Hexagon className="w-4 h-4 text-midnight-warning-bright flex-shrink-0" />
                    <span className="text-midnight-warning-bright font-semibold text-xs uppercase tracking-wide truncate">{getDisplayType()}</span>
                </div>
                <div className="space-y-0.5">
                    {providerName && <div className="text-white text-sm font-medium truncate" title={providerName}>{providerName}</div>}
                    {providerVersion && <div className="text-xs text-midnight-text-muted truncate">{providerVersion}</div>}
                    {processorName && <div className="text-xs text-midnight-warning-bright truncate" title={processorName}>{processorName}</div>}
                    {!providerName && !processorName && <div className="text-xs text-midnight-text-muted">External data function</div>}
                </div>
            </div>
            <TerminalDialogConfirmation isOpen={showDeleteConfirm} onAccept={() => { deleteProcessor(id); setShowDeleteConfirm(false); }} onCancel={() => setShowDeleteConfirm(false)} onClose={() => setShowDeleteConfirm(false)} title="Delete Function" content="Are you sure you wish to delete this function node?" />
        </div>
    );
};
