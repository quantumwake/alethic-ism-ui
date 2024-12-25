import React, { memo, useState } from 'react';
import BaseNode from "./BaseNode";
import {useStore} from "../../store";
import TerminalInfoButton from "../../components/common/TerminalInfoButton";
import {
    Upload,
    Download,
    Eraser,
    Trash2,
    ArrowLeft,
    ArrowRight,
} from 'lucide-react';

import TerminalDialogConfirmation from "../../components/common/TerminalDialogConfirmation";
import TerminalDataTable from "../../components/common/TerminalDataTable";
import TerminalStateUploadDialog from "../../components/ism/TerminalStateUploadDialog";
import TerminalStateDataTable from "../../components/ism/TerminalStateDataTable";

function BaseStateNode({ nodeId, renderAdditionalControls, renderAdditionalContent }) {
    const theme = useStore(state => state.getCurrentTheme());
    const nodeData = useStore(state => state.getNodeData(nodeId));
    const {purgeStateData, deleteState, setChannelInputId, setChannelOutputId} = useStore();

    // Dialog states
    const [dialogs, setDialogs] = useState({
        config: false,
        upload: false,
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
            icon: Upload,
            onClick: () => toggleDialog('upload'),
            className: theme.buttonSecondary,
            title: 'Upload Data'
        },
        {
            icon: Download,
            onClick: () => toggleDialog('view'),
            className: theme.buttonAccent,
            title: 'Download Data'
        },
        {
            icon: Eraser,
            onClick: () => toggleDialog('purgeConfirm'),
            className: theme.buttonDanger,
            title: 'Purge Data'
        },
        {
            icon: Trash2,
            onClick: () => toggleDialog('deleteConfirm'),
            className: theme.buttonDanger,
            title: 'Delete State'
        }
    ];

    const renderControls = () => (
        <div className="flex items-center gap-1">
            {actionButtons.map((button, index) => {
                const Icon = button.icon;
                return (
                    <button
                        key={index}
                        onClick={button.onClick}
                        className={`p-1 flex items-center justify-center rounded-sm ${button.className}`}
                        title={button.title}>
                        <Icon className={`w-3 h-3 ${theme.icon}`} />
                    </button>
                );
            })}
            {renderAdditionalControls}
        </div>
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