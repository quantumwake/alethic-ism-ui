import React, {memo, useEffect} from 'react';
import useStore from "./store";
import BaseProcessorNode from "./BaseProcessorNode";

function BaseProcessorLanguageNode({ providerName, nodeId, renderAdditionalControls, renderAdditionalContent, theme }) {
    const renderControls = () => (<>
        {/*add additional controls here*/}
        {renderAdditionalControls}

    </>);

    const renderContent = () => (<>
        {/*add additional node body*/}
        {renderAdditionalContent}
    </>);


    return (<>
        <BaseProcessorNode
            providerName={providerName}
            nodeId={nodeId}
            renderAdditionalControls={renderControls}
            renderAdditionalContent={renderContent}
            theme={theme} />

    </>);
}

export default memo(BaseProcessorLanguageNode);