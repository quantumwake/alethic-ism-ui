import React, {memo} from 'react';
import BaseProcessorNode from "./BaseProcessorNode";

function BaseProcessorLanguageNode({ providerName, className, nodeId, renderAdditionalControls, renderAdditionalContent, theme }) {
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
            className={className}
            nodeId={nodeId}
            renderAdditionalControls={renderControls}
            renderAdditionalContent={renderContent}
        />

    </>);
}

export default memo(BaseProcessorLanguageNode);