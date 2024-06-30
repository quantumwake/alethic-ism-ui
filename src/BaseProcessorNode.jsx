import React, {memo, useEffect, useState} from 'react';
import BaseNode from './BaseNode';
import {PencilIcon, PlayIcon, PauseIcon} from "@heroicons/react/24/outline";
import useStore from "./store";
import ProcessorConfigDialog from "./ProcessorConfigDialog";
import InfoButton from "./InfoButton";

function BaseProcessorNode({ providerName, className, nodeId, renderAdditionalControls, renderAdditionalContent, theme }) {
    const [isOpenConfig, setIsOpenConfig] = useState(false);
    const {getProviderById, getNodeData} = useStore()
    const localNodeData = useStore(state => getNodeData(nodeId))
    const localProvider = useStore(state => getProviderById(localNodeData?.provider_id))

    const fetchProcessorStates = useStore(state => state.fetchProcessorStates)
    const fetchProcessor = useStore(state => state.fetchProcessor)

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
                <PencilIcon className="h-6 w-4"/>
            </button>

            <button
                onClick={() => {
                }}
                className="ml-1 px-1.5 py-0.5 bg-red-400 text-white rounded-sm hover:bg-green-900 focus:outline-none">
                <PauseIcon className="h-6 w-4"/>
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