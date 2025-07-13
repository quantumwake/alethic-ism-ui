import React, {memo, useCallback, useEffect, useState, useMemo} from 'react';
import BaseNode from './BaseNode';
import {useStore} from "../../store";
import {Download, Eraser, Pause, Play, PlayIcon, Trash2, Upload, ChevronDown, ChevronRight} from 'lucide-react';
import {TerminalInfoButton} from "../../components/common";
import TerminalDialogConfirmation from "../../components/common/TerminalDialogConfirmation";

function BaseProcessorNode({ providerName, className, nodeId, renderAdditionalControls, renderAdditionalContent}) {

    const theme = useStore(state => state.getCurrentTheme());
    const {fetchProcessor, deleteProcessor, fetchProcessorStates, getProviderById, getNodeData} = useStore();
    const {toggleNodeCollapse, isNodeCollapsed, nodeHasChildren, getDescendantNodes} = useStore();

    const localNodeData = useStore(state => getNodeData(nodeId));
    const localProvider = useStore(state => getProviderById(localNodeData?.provider_id));
    const changeProcessorStatus = useStore(state => state.changeProcessorStatus);
    
    const hasChildren = useStore(state => state.nodeHasChildren(nodeId));
    const isCollapsed = useStore(state => state.isNodeCollapsed(nodeId));
    const descendantCount = useMemo(() => {
        return isCollapsed ? getDescendantNodes(nodeId).length : 0;
    }, [isCollapsed, nodeId, getDescendantNodes]);

    const [isStopped, setIsStopped] = useState(true);
    const [dataFetched, setDataFetched] = useState(false);

    useEffect(() => {
        if (!dataFetched && nodeId && !localNodeData?.status) {
            (async () => {
                const processorData = await fetchProcessor(nodeId);
                console.log(`fetched processor data for processor id: ${nodeId}`);
                setDataFetched(true);
                if (processorData?.status) {
                    setIsStopped(["TERMINATE", "STOPPED"].includes(processorData.status));
                } else {
                    setIsStopped(true);
                }
            })();
        }
    }, [nodeId, dataFetched, localNodeData?.status, fetchProcessor]);

    useEffect(() => {
        if (nodeId && !localNodeData?.associated_states) {
            (async () => {
                const associatedStates = await fetchProcessorStates(nodeId);
                console.log(`fetched processor state associations for processor id: ${nodeId}`);
            })();
        }
    }, [nodeId, localNodeData?.associated_states, fetchProcessorStates]);

    const updateStoppedStatus = useCallback(() => {
        const currentNode = getNodeData(nodeId);
        setIsStopped(["TERMINATE", "STOPPED"].includes(currentNode.status));
    }, [getNodeData, nodeId]);

    useEffect(() => {
        // if (localNodeData?.status) {
        //     setIsStopped(["TERMINATE", "STOPPED"].includes(localNodeData.status));
        // }
    }, [localNodeData?.status]);

    const startOrStopProcessor = async () => {
        const newStatus = isStopped ? "COMPLETED" : "TERMINATE";
        await changeProcessorStatus(nodeId, newStatus);
        updateStoppedStatus();
    };

    const renderHeader = () => (
        <>
            <TerminalInfoButton id={nodeId} details={""} theme={theme}/>
            <span className={`py-0.5 px-0.5 text-xs`}>
                {localProvider?.name}
            </span>
        </>
    );


    const toggleDialog = (dialog) => {
        setDialogs(prev => ({ ...prev, [dialog]: !prev[dialog] }));
    };

    // dialog states
    const [dialogs, setDialogs] = useState({
        // config: false,
        // upload: false,
        // view: false,
        // purgeConfirm: false,
        deleteConfirm: false
    });

    // button configuration for consistent
    const actionButtons = [
        // {
        //     icon: Upload,
        //     onClick: () => toggleDialog('upload'),
        //     className: theme.buttonSecondary,
        //     title: 'Upload Data'
        // },
        // {
        //     icon: Download,
        //     onClick: () => toggleDialog('view'),
        //     className: theme.buttonAccent,
        //     title: 'Download Data'
        // },
        // {
        //     icon: PlayIcon,
        //     onClick: () => startOrStopProcessor,
        //     className: theme.buttonDanger,
        //     title: 'Purge Data'
        // },
        {
            icon: Trash2,
            onClick: () => toggleDialog('deleteConfirm'),
            className: theme.buttonDanger,
            title: 'Delete Processor'
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
        {renderAdditionalControls({})}
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
            <button onClick={startOrStopProcessor} className={`p-1 flex items-center justify-center rounded-sm ${isStopped ? theme.buttonAccent : theme.buttonDanger}`}>
                {isStopped ? (
                    <Play className={`w-3 h-3 ${theme.nodes?.processor?.icon}`} />
                ) : (
                    <Pause className={`w-3 h-3 ${theme.nodes?.processor?.icon}`} />
                )}
            </button>
        </div>
    );

    const renderContent = () => (
        <div className={`flex flex-col ${theme.text}`}>
            <div className="p-1.5 font-bold">{localProvider?.class_name}</div>
            <div className="p-1.5 font-medium">{localProvider?.version}</div>
            {renderAdditionalContent({nodeId: nodeId})}
        </div>
    );

    return (
        <>
            <BaseNode
                type="processor"
                nodeId={nodeId}
                renderHeader={renderHeader}
                renderContent={renderContent}
                renderControls={renderControls}>
            </BaseNode>


            <TerminalDialogConfirmation
                isOpen={dialogs.deleteConfirm}
                onAccept={() => deleteProcessor(nodeId)}
                onCancel={() => {console.log(`cancel: delete processor ${nodeId}`)}}
                onClose={(open) => toggleDialog('deleteConfirm')}
                title="Permanently Deletion Runtime Node"
                content="Are you sure you wish to delete this processor and all its associated input and output links?">
            </TerminalDialogConfirmation>
        </>
    );
}

export default memo(BaseProcessorNode);