import React, {memo} from 'react';
import BaseProcessorLanguageNode from "./BaseProcessorLanguageNode";
import theme from "./theme";

function ProcessorNodeAnthropic({ id, data }) {
    const renderAdditionalControls = ({ setIsOpenConfig }) => (<>

    </>);

    const renderAdditionalContent = () => (<>

    </>);

    return (
        <BaseProcessorLanguageNode
            providerName="Anthropic"
            className="NaturalLanguageProcessing"
            nodeId={id}
            renderAdditionalControls={renderAdditionalControls}
            renderAdditionalContent={renderAdditionalContent}
            theme={theme.anthropic}
        />
    );
}

export default memo(ProcessorNodeAnthropic);
