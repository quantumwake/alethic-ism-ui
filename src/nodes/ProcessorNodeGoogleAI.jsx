import React, {memo} from 'react';
import BaseProcessorNode from "../nodes/base/BaseProcessorNode";

function ProcessorNodeGoogleAI({ id, data }) {
    const renderAdditionalControls = ({ }) => (<>

    </>);

    const renderAdditionalContent = () => (<>

    </>);

    return (
        <BaseProcessorNode
            providerName="Google"
            className="NaturalLanguageProcessing"
            nodeId={id}
            renderAdditionalControls={renderAdditionalControls}
            renderAdditionalContent={renderAdditionalContent}
        />
    );
}

export default memo(ProcessorNodeGoogleAI);
