import React, {memo} from 'react';
import BaseProcessorLanguageNode from "./base/BaseProcessorLanguageNode";

function ProcessorNodeOpenAI({ id, data }) {
    const renderAdditionalControls = ({}) => (<>

    </>);

    const renderAdditionalContent = () => (<>

    </>);

    return (
        <BaseProcessorLanguageNode
            providerName="OpenAI"
            className="NaturalLanguageProcessing"
            nodeId={id}
            renderAdditionalControls={renderAdditionalControls}
            renderAdditionalContent={renderAdditionalContent}
        />
    );
}

export default memo(ProcessorNodeOpenAI);
