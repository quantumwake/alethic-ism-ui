import React, { useEffect, useState } from 'react';
import type { NodeComponentProps } from '../../../kgraph';
import { useStore } from '../../../store';
import { Database } from 'lucide-react';
import { TerminalDialogConfirmation } from '../../common';
import TerminalStateDataTable from '../TerminalStateDataTable';
import TerminalStateUploadDialog from '../TerminalStateUploadDialog';
import TerminalStateExportDialog from '../TerminalStateExportDialog';
import TerminalStateImportHgDialog from '../TerminalStateImportHgDialog';
import TerminalStateExportHgDialog from '../TerminalStateExportHgDialog';
import { NODE_WIDTH, NODE_HEIGHT, NODE_SIZE } from './constants';
import { renderHandles } from './renderHandles';
import { NodeToolbar } from './NodeToolbar';

export const StateNodeComponent: React.FC<NodeComponentProps> = ({ id, data, selected }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { deleteState, setSelectedNodeId, purgeStateData, fetchState, setNodeVisualCollapsed } = useStore();
    const isCollapsed = useStore(state => state.isNodeVisuallyCollapsed(id));
    const setIsCollapsed = (collapsed: boolean) => setNodeVisualCollapsed(id, collapsed);

    useEffect(() => { if (id) fetchState(id); }, [id, fetchState]);

    const nodeData = useStore(state => state.getNodeData(id)) || data || {};
    const [dialogs, setDialogs] = useState({
        view: false, upload: false, export: false, hgImport: false, hgExport: false, purgeConfirm: false, deleteConfirm: false,
    });
    const toggleDialog = (dialog: string) => setDialogs(prev => ({ ...prev, [dialog]: !prev[dialog as keyof typeof prev] }));

    const rowCount = nodeData?.count;
    const stateType = nodeData?.state_type || 'state';
    const configName = nodeData?.config?.name;

    const handleDoubleClick = () => {
        if (!rowCount || rowCount === 0) toggleDialog('upload');
        else toggleDialog('view');
    };

    const toolbarActions = {
        onSettings: () => setSelectedNodeId(id),
        onDelete: () => toggleDialog('deleteConfirm'),
        onView: () => toggleDialog('view'),
        onExport: () => toggleDialog('export'),
        onImport: () => toggleDialog('upload'),
        onImportHg: () => toggleDialog('hgImport'),
        onExportHg: () => toggleDialog('hgExport'),
        onPurge: () => toggleDialog('purgeConfirm'),
    };

    if (isCollapsed) {
        const label = configName || stateType;
        return (
            <div style={{ width: 40, height: 40 }} className="group relative">
                <div
                    className={`w-10 h-10 relative flex items-center justify-center cursor-pointer bg-midnight-success/30 border-2 border-midnight-success/50 hover:border-midnight-success-bright hover:bg-midnight-success/50 ${selected ? 'border-midnight-success-bright shadow-midnight-success' : ''} transition-all duration-200`}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onDoubleClick={() => setIsCollapsed(false)}
                    title={`${label}${rowCount ? ` (${rowCount} rows)` : ''}\nDouble-click to expand`}
                >
                    {renderHandles('#10b981')}
                    <Database className="w-5 h-5 text-midnight-success-bright" />
                </div>
                {label && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 text-[9px] text-midnight-text-subdued text-center mt-1 w-[80px] leading-tight opacity-40 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" title={label}>
                        {label}
                    </div>
                )}
                <TerminalStateDataTable isOpen={dialogs.view} onClose={() => toggleDialog('view')} nodeId={id} />
                <TerminalStateUploadDialog isOpen={dialogs.upload} setIsOpen={() => toggleDialog('upload')} nodeId={id} />
                <TerminalDialogConfirmation isOpen={dialogs.deleteConfirm} onAccept={() => { deleteState(id); toggleDialog('deleteConfirm'); }} onCancel={() => toggleDialog('deleteConfirm')} onClose={() => toggleDialog('deleteConfirm')} title="Delete State" content="Are you sure you wish to delete this state entirely?" />
            </div>
        );
    }

    return (
        <div style={{ width: NODE_WIDTH, height: NODE_HEIGHT }}>
            <div
                className={`${NODE_SIZE} px-3 py-2 relative bg-gradient-to-br from-midnight-success/30 via-midnight-elevated to-midnight-surface border-2 ${selected ? 'border-midnight-success-bright shadow-midnight-success' : 'border-midnight-border'} transition-all duration-200`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onDoubleClick={handleDoubleClick}
            >
                {(isHovered || selected) && <NodeToolbar nodeId={id} nodeType="state" actions={toolbarActions} />}
                {renderHandles('#10b981')}
                <div className="flex items-center gap-2 border-b border-midnight-border/50 pb-2 mb-2">
                    <Database className="w-4 h-4 text-midnight-success-bright flex-shrink-0" />
                    <span className="text-midnight-success-bright font-semibold text-xs uppercase tracking-wide truncate">{stateType}</span>
                    <button onClick={(e) => { e.stopPropagation(); setIsCollapsed(true); }} className="ml-auto p-1 hover:bg-midnight-success/30 text-midnight-text-subdued hover:text-midnight-success-bright transition-colors" title="Collapse">
                        <span className="text-xs">−</span>
                    </button>
                </div>
                <div className="space-y-1">
                    {configName && <div className="text-white text-sm font-medium truncate" title={configName}>{configName}</div>}
                    <div className="text-xs text-midnight-text-muted">
                        {rowCount !== undefined && rowCount > 0
                            ? <span className="text-midnight-success-bright">{rowCount} rows</span>
                            : <span className="text-midnight-text-subdued italic">Empty</span>}
                    </div>
                </div>
            </div>
            <TerminalStateDataTable isOpen={dialogs.view} onClose={() => toggleDialog('view')} nodeId={id} />
            <TerminalStateUploadDialog isOpen={dialogs.upload} setIsOpen={() => toggleDialog('upload')} nodeId={id} />
            <TerminalStateExportDialog isOpen={dialogs.export} setIsOpen={() => toggleDialog('export')} stateId={id} />
            <TerminalStateImportHgDialog isOpen={dialogs.hgImport} setIsOpen={() => toggleDialog('hgImport')} stateId={id} />
            <TerminalStateExportHgDialog isOpen={dialogs.hgExport} setIsOpen={() => toggleDialog('hgExport')} stateId={id} />
            <TerminalDialogConfirmation isOpen={dialogs.purgeConfirm} onAccept={() => { purgeStateData(id); toggleDialog('purgeConfirm'); }} onCancel={() => toggleDialog('purgeConfirm')} onClose={() => toggleDialog('purgeConfirm')} title="Purge State Data" content="This process is irreversible. Are you sure you wish to delete all data within the selected state?" />
            <TerminalDialogConfirmation isOpen={dialogs.deleteConfirm} onAccept={() => { deleteState(id); toggleDialog('deleteConfirm'); }} onCancel={() => toggleDialog('deleteConfirm')} onClose={() => toggleDialog('deleteConfirm')} title="Delete State" content="Are you sure you wish to delete this state entirely?" />
        </div>
    );
};
