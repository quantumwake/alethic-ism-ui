import React, {memo} from 'react';
import BaseProcessorLanguageNode from "./BaseProcessorLanguageNode";
import theme from "./theme";

function ProcessorNodeLLAMA({ id, data }) {
    const renderAdditionalControls = ({ setIsOpenConfig }) => (<>

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
            theme={theme.llama}
        />
    );
}

export default memo(ProcessorNodeLLAMA);
