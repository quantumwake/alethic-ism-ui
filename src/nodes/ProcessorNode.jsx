import React, {memo} from 'react';
import BaseProcessorNode from "./base/BaseProcessorNode";

function ProcessorNode({ id, data }) {
    const renderAdditionalControls = ({}) => (<>

    </>);

    const renderAdditionalContent = ({}) => (<>

    </>);

    return (
        <BaseProcessorNode
            providerName="Anthropic"
            className="NaturalLanguageProcessing"
            nodeId={id}
            renderAdditionalControls={renderAdditionalControls}
            renderAdditionalContent={renderAdditionalContent}
        />
    );
}

export default memo(ProcessorNodeAnthropic);
