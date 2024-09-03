import React, {memo, useCallback, useEffect, useState} from 'react';
import BaseNode from './BaseNode';
import {PencilIcon, PlayIcon, PauseIcon} from "@heroicons/react/24/solid";
import useStore from "./store";
import ProcessorConfigDialog from "./ProcessorConfigDialog";
import InfoButton from "./InfoButton";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit} from "@fortawesome/free-solid-svg-icons/faEdit";
import {faPause, faPlay} from "@fortawesome/free-solid-svg-icons";

function BaseProcessorNode({ providerName, className, nodeId, renderAdditionalControls, renderAdditionalContent, theme }) {
    const [isOpenConfig, setIsOpenConfig] = useState(false);
    const [isStopped, setIsStopped] = useState(true);

    const {getProviderById, getNodeData} = useStore()
    const localNodeData = useStore(state => getNodeData(nodeId))
    const localProvider = useStore(state => getProviderById(localNodeData?.provider_id))

    const fetchProcessorStates = useStore(state => state.fetchProcessorStates)
    const fetchProcessor = useStore(state => state.fetchProcessor)
    const changeProcessorStatus = useStore(state => state.changeProcessorStatus)


    // Fetch state object data if nodeId is provided
    useEffect(() => {
        (async () => {
            // these are the processor data
            const processorData = await fetchProcessor(nodeId)
            console.log(`fetched processor data for processor id: ${nodeId}`)

        })();
    }, [nodeId])

    useEffect(() => {
        (async () => {
            // these are the associated edges as defined by ProcessorState
            const associatedStates = await fetchProcessorStates(nodeId)
            console.log(`fetched processor state associations for processor id: ${nodeId}`)


        })();
    }, [nodeId])

    // const isStopped = async() => {
    //     const current_node = getNodeData(nodeId)
    //     return["TERMINATE", "STOPPED"].includes(current_node.status)
    // }

    const updateStoppedStatus = useCallback(() => {
        const currentNode = getNodeData(nodeId);
        setIsStopped(["TERMINATE", "STOPPED"].includes(currentNode.status));
    }, [getNodeData, nodeId]);

    const startOrStopProcessor = async () => {
        const newStatus = isStopped ? "COMPLETED" : "TERMINATE";
        await changeProcessorStatus(nodeId, newStatus);
        updateStoppedStatus();

        if (isStopped) {
            await changeProcessorStatus(nodeId, "COMPLETED")
        } else {
            await changeProcessorStatus(nodeId, "TERMINATE")
        }
    }

    const renderHeader = () => (
        <>
            <InfoButton id={nodeId} details={providerName}></InfoButton>
            {localProvider?.name || providerName}
        </>
    )

    const renderControls = () => (
        <>
            {renderAdditionalControls({setIsOpenConfig})}

            <button
                onClick={() => setIsOpenConfig(true)}
                className="px-1.5 py-0.5 bg-sky-500 text-white rounded-sm hover:bg-sky-900 focus:outline-none">
                <FontAwesomeIcon className="h-6 w-3" icon={faEdit}/>
            </button>

            <button
                onClick={startOrStopProcessor}
                className={`ml-1 px-1.5 py-0.5 text-white rounded-sm focus:outline-none transition-colors duration-200 ${
                    isStopped
                        ? "bg-green-500 hover:bg-green-700"
                        : "bg-red-500 hover:bg-red-700"
                }`}
            >
                {isStopped ? (
                    <FontAwesomeIcon className="h-4 w-3" icon={faPlay}/>
                ) : (
                    <FontAwesomeIcon className="h-4 w-3" icon={faPause}/>
                    // <PauseIcon className="h-6 w-4" />
                )}
            </button>
        </>
    );

    const renderContent = () => (<>
        <div className="flex p-1.5 font-bold">{localProvider?.class_name}</div>
        <div className="flex p-1.5 font-medium">{localProvider?.version}</div>

        {
            renderAdditionalContent({
                isOpenConfig,
                setIsOpenConfig,
                nodeId: nodeId
            })
        }</>);


    return (<>
        <BaseNode
            nodeId={nodeId}
            renderHeader={renderHeader}
            renderContent={renderContent}
            renderControls={renderControls}
            theme={theme}/>

        {/*add additional components to the body here*/}
        <ProcessorConfigDialog isOpen={isOpenConfig} setIsOpen={setIsOpenConfig} providerName={providerName} className={className} nodeId={nodeId} />

    </>);
}

export default memo(BaseProcessorNode)