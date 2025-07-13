import React, {memo, useEffect, useRef, useState, useMemo} from 'react';
import BaseNode from "./BaseNode";
import {useStore} from "../../store";
import {
    Upload,
    Download,
    Link,
    Eraser,
    Trash2,
    ArrowLeft,
    ArrowRight,
    EyeIcon,
    FileInputIcon,
    FileOutputIcon,
    ImportIcon,
    TableIcon,
    LucideBug,
    DatabaseIcon,
    CloudDownloadIcon,
    CloudUploadIcon,
    ViewIcon,
    FileSpreadsheetIcon,
    HardDriveDownloadIcon,
    HardDriveUploadIcon,
    ChevronDown,
    ChevronRight,
} from 'lucide-react';

import {TerminalDialogConfirmation, TerminalHoverMenu, TerminalInfoButton} from "../../components/common";
import TerminalStateUploadDialog from "../../components/ism/TerminalStateUploadDialog";
import TerminalStateDataTable from "../../components/ism/TerminalStateDataTable";
import TerminalStateImportHgDialog from "../../components/ism/TerminalStateImportHgDialog";
import TerminalStateExportDialog from "../../components/ism/TerminalStateExportDialog";

function BaseStateNode({ nodeId, renderAdditionalControls, renderAdditionalContent }) {
    const theme = useStore(state => state.getCurrentTheme());
    // const {workflowNodes, getNode} = useStore();
    const {fetchState} = useStore();
    // const node = useStore(state => state.getNode(nodeId));
    const nodeData = useStore(state => state.getNodeData(nodeId));
    // const [nodeData, setNodeData] = useState()
    const {purgeStateData, deleteState, setChannelInputId, setChannelOutputId} = useStore();
    const {toggleNodeCollapse, isNodeCollapsed, nodeHasChildren, getDescendantNodes} = useStore();
    
    const hasChildren = useStore(state => state.nodeHasChildren(nodeId));
    const isCollapsed = useStore(state => state.isNodeCollapsed(nodeId));
    const descendantCount = useMemo(() => {
        return isCollapsed ? getDescendantNodes(nodeId).length : 0;
    }, [isCollapsed, nodeId, getDescendantNodes]);

    useEffect(() => {
        fetchState(nodeId).then(r => {});
    }, [nodeId])

    // Dialog states
    const [dialogs, setDialogs] = useState({
        config: false,
        upload: false,
        export: false,
        hgImport: false,
        hgExport: false,
        view: false,
        purgeConfirm: false,
        deleteConfirm: false
    });

    const toggleDialog = (dialog) => {
        setDialogs(prev => ({ ...prev, [dialog]: !prev[dialog] }));
    };

    const renderHeader = () => (<>
        <TerminalInfoButton id={nodeId} details={nodeData?.state_type} />
        <span className={`py-0.5 px-0.5 text-xs`}>
            {nodeData?.state_type}
        </span>
    </>);

    // Button configuration for consistent styling
    const actionButtons = [
        {
            icon: DatabaseIcon,
            title: "Data",
            subItems: [
                {
                    icon: HardDriveDownloadIcon,
                    onClick: () => toggleDialog('export'),
                    title: 'Export to sheet'
                },
                {
                    icon: HardDriveUploadIcon,
                    onClick: () => toggleDialog('upload'),
                    title: 'Import from sheet'
                },
                {
                    icon: CloudUploadIcon,
                    onClick: () => toggleDialog('hgImport'),
                    title: 'Import from huggingface'
                },
                // {
                //     icon: CloudDownloadIcon,
                //     onClick: () => toggleDialog('hgImport'),
                //     className: theme.buttonAccent,
                //     title: 'HuggingFace Dataset Export'
                // },
            ]
        },
        {
            icon: ViewIcon,
            onClick: () => toggleDialog('view'),
            title: 'View Data'
        },
        {
            icon: Eraser,
            onClick: () => toggleDialog('purgeConfirm'),
            title: 'Purge Data'
        },
        {
            icon: Trash2,
            onClick: () => toggleDialog('deleteConfirm'),
            title: 'Delete State'
        },
        {
            icon: LucideBug,
            onClick: () => toggleDialog('deleteConfirm'),
            title: 'Delete State'
        }
    ];


    const renderControls = () => (
        <div className="flex items-center gap-1">
            {hasChildren ? (
                <button
                    onClick={() => toggleNodeCollapse(nodeId)}
                    className={`p-1 min-w-[3rem] h-5 flex items-center justify-center rounded-sm ${isCollapsed ? 'bg-purple-600 bg-opacity-60 text-white' : 'bg-purple-900 bg-opacity-20 text-white text-opacity-40'} hover:bg-purple-600 hover:bg-opacity-100 hover:text-white`}
                    title={isCollapsed ? `Expand (${descendantCount} hidden)` : 'Collapse'}>
                    {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {isCollapsed && descendantCount > 0 && (
                        <span className="ml-1 text-xs">{descendantCount}</span>
                    )}
                </button>
            ) : (
                <div className="p-1 min-w-[3rem] h-5" />
            )}
            <TerminalHoverMenu actionButtons={actionButtons} theme={theme} />
        </div>
    );

    const renderContent = () => (
        <div className={`flex flex-col ${theme.text}`}>
            <div className="p-2">
                <div>{nodeData?.config?.name}</div>
                <div className="text-xs text-gray-500">
                    {nodeData?.count ? `${nodeData.count} rows` : 'Empty - double-click to upload'}
                </div>
            </div>

            {renderAdditionalContent}

            <div className="mt-6 flex flex-row justify-between">
                <button
                    onClick={() => setChannelInputId(nodeId)}
                    className={`p-1 flex items-center justify-center rounded-sm ${theme.hover}`}
                    aria-label="Ingress">
                    <ArrowLeft className={`w-3 h-3 ${theme.icon}`} />
                </button>

                <button
                    onClick={() => setChannelOutputId(nodeId)}
                    className={`p-1 flex items-center justify-center rounded-sm ${theme.hover}`}
                    aria-label="Egress">
                    <ArrowRight className={`w-3 h-3 ${theme.icon}`} />
                </button>
            </div>
        </div>
    );

    const handleNodeDoubleClick = () => {
        // Check if state is empty using count
        if (!nodeData?.count || nodeData.count === 0) {
            // If empty, show upload dialog
            toggleDialog('upload');
        } else {
            // If has data, show table view
            toggleDialog('view');
        }
    };

    return (
        <>
            <div onDoubleClick={handleNodeDoubleClick}>
                <BaseNode
                    type="state"
                    nodeId={nodeId}
                    renderHeader={renderHeader}
                    renderControls={renderControls}
                    renderContent={renderContent}
                    theme={theme}>
                </BaseNode>
            </div>

            <TerminalDialogConfirmation
                isOpen={dialogs.purgeConfirm}
                onAccept={() => purgeStateData(nodeId)}
                onCancel={() => {console.log(`cancel: state ${nodeId} truncate data`)}}
                onClose={() => toggleDialog('purgeConfirm')}
                title="Purge State Data"
                content="This process is irreversible. Are you sure you wish to delete all data within the selected state?">
            </TerminalDialogConfirmation>

            <TerminalDialogConfirmation
                isOpen={dialogs.deleteConfirm}
                onAccept={() => deleteState(nodeId)}
                onCancel={() => {console.log(`cancel: delete state ${nodeId}`)}}
                onClose={(open) => toggleDialog('deleteConfirm')}
                title="Permanently Delete State"
                content="Are you sure you wish to delete this state entirely?">
            </TerminalDialogConfirmation>

            <TerminalStateUploadDialog
                isOpen={dialogs.upload}
                setIsOpen={(open) => toggleDialog('upload')}
                nodeId={nodeId}>
            </TerminalStateUploadDialog>

            <TerminalStateExportDialog
                isOpen={dialogs.export}
                setIsOpen={(open) => toggleDialog('export')}
                stateId={nodeId}>
            </TerminalStateExportDialog>

            <TerminalStateImportHgDialog
                isOpen={dialogs.hgImport}
                setIsOpen={(open) => toggleDialog('hgImport')}
                stateId={nodeId}>
            </TerminalStateImportHgDialog>

            <TerminalStateDataTable
                isOpen={dialogs.view}
                onClose={(open) => toggleDialog('view')}
                nodeId={nodeId}>
            </TerminalStateDataTable>
        </>
    );
}

export default BaseStateNode;