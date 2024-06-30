import React, {memo} from 'react';
import BaseProcessorLanguageNode from "./BaseProcessorLanguageNode";
import theme from "./theme";

function ProcessorNodeVisualOpenAI({ id, data }) {
    const renderAdditionalControls = ({ setIsOpenConfig }) => (<>

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
            theme={theme.openai}
        />
    );
}

export default memo(ProcessorNodeVisualOpenAI);
