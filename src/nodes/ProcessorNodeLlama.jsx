import React, {memo} from 'react';
import BaseProcessorLanguageNode from "./base/BaseProcessorLanguageNode";

function ProcessorNodeLLAMA({ id, data }) {
    const renderAdditionalControls = ({}) => (<>

    </>);

    const renderAdditionalContent = () => (<>

    </>);

    return (
        <BaseProcessorLanguageNode
            providerName="Llama"
            className="NaturalLanguageProcessing"
            nodeId={id}
            renderAdditionalControls={renderAdditionalControls}
            renderAdditionalContent={renderAdditionalContent}
        />
    );
}

export default memo(ProcessorNodeLLAMA);
