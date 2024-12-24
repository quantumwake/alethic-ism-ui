import React, {memo} from 'react';
import BaseProcessorLanguageNode from "./base/BaseProcessorLanguageNode";

function ProcessorNodeVisualOpenAI({ id, data }) {
    const renderAdditionalControls = ({}) => (<>

    </>);

    const renderAdditionalContent = () => (<>

    </>);

    return (
        <BaseProcessorLanguageNode
            providerName="OpenAI"
            className="ImageProcessing"
            nodeId={id}
            renderAdditionalControls={renderAdditionalControls}
            renderAdditionalContent={renderAdditionalContent}
        />
    );
}

export default memo(ProcessorNodeVisualOpenAI);
