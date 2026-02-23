import React, { useCallback, useEffect, useState } from 'react';
import type { NodeComponentProps } from '../../../kgraph';
import { useStore } from '../../../store';
import { Cpu } from 'lucide-react';
import { TerminalDialogConfirmation } from '../../common';
import { NODE_WIDTH, NODE_HEIGHT, NODE_SIZE } from './constants';
import { renderHandles } from './renderHandles';
import { NodeToolbar } from './NodeToolbar';

const getClassShorthand = (providerClass: string): string => {
    const classMap: Record<string, string> = {
        'CodeProcessing': 'CODE',
        'DatabaseProcessing': 'DB',
        'DataTransformation': 'DATA',
        'ImageProcessing': 'IMG',
        'Interaction': 'INTERACT',
        'NaturalLanguageProcessing': 'NLP',
    };
    return classMap[providerClass] || '';
};

export const ProcessorNodeComponent: React.FC<NodeComponentProps> = ({ id, data, selected }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { deleteProcessor, setSelectedNodeId, fetchProcessor, setNodeVisualCollapsed, changeProcessorStatus, getNodeData } = useStore();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isStopped, setIsStopped] = useState(true);
    const isCollapsed = useStore(state => state.isNodeVisuallyCollapsed(id));
    const setIsCollapsed = (collapsed: boolean) => setNodeVisualCollapsed(id, collapsed);

    useEffect(() => {
        if (id) {
            fetchProcessor(id).then((processorData: any) => {
                if (processorData?.status) {
                    setIsStopped(['TERMINATE', 'STOPPED'].includes(processorData.status));
                }
            });
        }
    }, [id, fetchProcessor]);

    const nodeData = useStore(state => state.getNodeData(id)) || data || {};
    const provider = useStore(state => state.getProviderById(nodeData?.provider_id));
    const processorType = nodeData?.processor_type || data?.type || 'processor';
    const providerName = provider?.name || '';
    const providerClass = provider?.class_name || '';
    const providerVersion = provider?.version || '';
    const processorName = nodeData?.name || '';

    const startOrStopProcessor = useCallback(async () => {
        const newStatus = isStopped ? 'COMPLETED' : 'TERMINATE';
        await changeProcessorStatus(id, newStatus);
        const currentNode = getNodeData(id);
        setIsStopped(['TERMINATE', 'STOPPED'].includes(currentNode?.status));
    }, [id, isStopped, changeProcessorStatus, getNodeData]);

    const getDisplayType = () => {
        const typeMap: Record<string, string> = {
            'processor_openai': 'OpenAI',
            'processor_anthropic': 'Anthropic',
            'processor_google_ai': 'Google AI',
            'processor_llama': 'Llama',
            'processor_mistral': 'Mistral',
            'processor_python': 'Python',
            'processor_visual_openai': 'Vision',
            'processor_provider': providerName || 'Provider',
            'processor_state_coalescer': 'Coalescer',
            'processor_state_composite': 'Composite',
        };
        return typeMap[processorType] || processorType.replace('processor_', '').replace(/_/g, ' ');
    };

    const classShort = getClassShorthand(providerClass);

    const toolbarActions = {
        onSettings: () => setSelectedNodeId(id),
        onDelete: () => setShowDeleteConfirm(true),
        onPlayPause: startOrStopProcessor,
    };

    if (isCollapsed) {
        return (
            <div style={{ width: 40, height: 40 }} className="group relative">
                <div
                    className={`w-10 h-10 relative flex items-center justify-center cursor-pointer bg-midnight-warning/30 border-2 border-midnight-warning/50 hover:border-midnight-warning-bright hover:bg-midnight-warning/50 ${selected ? 'border-midnight-warning-bright shadow-[0_0_15px_rgba(245,158,11,0.4)]' : ''} transition-all duration-200`}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onDoubleClick={() => setIsCollapsed(false)}
                    title={`${getDisplayType()}${providerName ? `: ${providerName}` : ''}${providerVersion ? ` v${providerVersion}` : ''}${processorName ? `\n${processorName}` : ''}\nDouble-click to expand`}
                >
                    {renderHandles('#f59e0b')}
                    <Cpu className="w-5 h-5 text-midnight-warning-bright" />
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 text-[9px] text-center mt-1 w-[80px] leading-tight opacity-40 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    {providerVersion && <div className="text-midnight-text-subdued">{providerVersion.includes('/') ? providerVersion.split('/').pop() : providerVersion}</div>}
                    {processorName && <div className="text-midnight-warning-bright/70">{processorName.includes('/') ? processorName.split('/').pop() : processorName}</div>}
                </div>
                <TerminalDialogConfirmation isOpen={showDeleteConfirm} onAccept={() => { deleteProcessor(id); setShowDeleteConfirm(false); }} onCancel={() => setShowDeleteConfirm(false)} onClose={() => setShowDeleteConfirm(false)} title="Delete Processor" content="Are you sure you wish to delete this processor and all its connections?" />
            </div>
        );
    }

    return (
        <div style={{ width: NODE_WIDTH, height: NODE_HEIGHT }}>
            <div
                className={`${NODE_SIZE} px-3 py-2 relative bg-gradient-to-br from-midnight-warning/30 via-midnight-elevated to-midnight-surface border-2 ${selected ? 'border-midnight-warning-bright shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'border-midnight-border'} transition-all duration-200`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {(isHovered || selected) && <NodeToolbar nodeId={id} nodeType="processor" actions={toolbarActions} isStopped={isStopped} />}
                {renderHandles('#f59e0b')}
                <div className="flex items-center gap-2 border-b border-midnight-border/50 pb-2 mb-2">
                    <Cpu className="w-4 h-4 text-midnight-warning-bright flex-shrink-0" />
                    <span className="text-midnight-warning-bright font-semibold text-xs uppercase tracking-wide truncate">{getDisplayType()}{classShort ? ` · ${classShort}` : ''}</span>
                    <button onClick={(e) => { e.stopPropagation(); setIsCollapsed(true); }} className="ml-auto p-1 hover:bg-midnight-warning/30 text-midnight-text-subdued hover:text-midnight-warning-bright transition-colors" title="Collapse">
                        <span className="text-xs">−</span>
                    </button>
                </div>
                <div className="space-y-0.5">
                    {providerName && <div className="text-white text-sm font-medium truncate" title={providerName}>{providerName}</div>}
                    {providerVersion && <div className="text-xs text-midnight-text-muted truncate">{providerVersion}</div>}
                    {processorName && <div className="text-xs text-midnight-warning-bright truncate" title={processorName}>{processorName}</div>}
                </div>
            </div>
            <TerminalDialogConfirmation isOpen={showDeleteConfirm} onAccept={() => { deleteProcessor(id); setShowDeleteConfirm(false); }} onCancel={() => setShowDeleteConfirm(false)} onClose={() => setShowDeleteConfirm(false)} title="Delete Processor" content="Are you sure you wish to delete this processor and all its connections?" />
        </div>
    );
};
