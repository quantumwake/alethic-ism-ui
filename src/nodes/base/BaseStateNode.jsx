import React, {memo, useEffect, useRef, useState} from 'react';
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
} from 'lucide-react';

import {TerminalDialogConfirmation, TerminalHoverMenu, TerminalInfoButton} from "../../components/common";
import TerminalStateUploadDialog from "../../components/ism/TerminalStateUploadDialog";
import TerminalStateDataTable from "../../components/ism/TerminalStateDataTable";
import TerminalStateImportHgDialog from "../../components/ism/TerminalStateImportHgDialog";
import TerminalStateExportDialog from "../../components/ism/TerminalStateExportDialog";

function BaseStateNode({ nodeId, renderAdditionalControls, renderAdditionalContent }) {
    const theme = useStore(state => state.getCurrentTheme());
    const nodeData = useStore(state => state.getNodeData(nodeId));
    const {purgeStateData, deleteState, setChannelInputId, setChannelOutputId} = useStore();

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
        <TerminalHoverMenu actionButtons={actionButtons} theme={theme} />

        // <div className="relative flex items-center gap-1">
        //     {/*<SquareMenuIcon*/}
        //     {/*    className={`ml-2 w-3 h-3 ${theme.icon}`}*/}
        //     {/*    onClick={e => {*/}
        //     {/*        setIsContextMenuOpen(true);*/}
        //     {/*    }}*/}
        //     {/*/>*/}
        //
        //     <button
        //         onClick={() => setIsContextMenuOpen(true)}
        //         className={`p-1 flex items-center justify-center rounded-sm`}
        //         title="Actions">
        //         <SquareMenuIcon className={`w-3 h-3 ${theme.icon}`} />
        //     </button>
        //
        //     {/* 3) Absolute menu at the captured coords */}
        //     <TerminalContextMenu
        //         className="absolute z-10"
        //         menuItems={contextMenuItems}
        //         menuRef={contextMenuRef}
        //         isOpen={isContextMenuOpen}
        //         setIsOpen={setIsContextMenuOpen}
        //         onItemClick={handleItemClick}
        //     />
        //
        //     {renderAdditionalControls}
        // </div>
        //     {actionButtons.map((button, index) => {
        //         const Icon = button.icon;
        //         return (
        //             <button
        //                 key={index}
        //                 onClick={button.onClick}
        //                 className={`p-1 flex items-center justify-center rounded-sm ${button.className}`}
        //                 title={button.title}>
        //                 <Icon className={`w-3 h-3 ${theme.icon}`} />
        //             </button>
        //         );
        //     })}
        // </div>
    );

    const renderContent = () => (
        <div className={`flex flex-col ${theme.text}`}>
            <div className="p-2">
                {nodeData?.config?.name}
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

    return (
        <>
            <BaseNode
                type="state"
                nodeId={nodeId}
                renderHeader={renderHeader}
                renderControls={renderControls}
                renderContent={renderContent}
                theme={theme}>
            </BaseNode>

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

            {/*<TerminalDataTable*/}
            {/*        isOpen={dialogs.view}*/}
            {/*        onClose={(open) => toggleDialog('view')}*/}
            {/*        nodeId={nodeId}>*/}
            {/*</TerminalDataTable>*/}

            <TerminalStateDataTable
                isOpen={dialogs.view}
                onClose={(open) => toggleDialog('view')}
                nodeId={nodeId}>
            </TerminalStateDataTable>
        </>
    );
}

export default memo(BaseStateNode);