import React, {memo} from 'react';
import BaseProcessorLanguageNode from "./BaseProcessorLanguageNode";
import theme from "./theme";

function ProcessorNodeGoogleAI({ id, data }) {
    const renderAdditionalControls = ({ setIsOpenConfig }) => (<>

    </>);

    const renderAdditionalContent = () => (<>

    </>);

    return (
        <BaseProcessorLanguageNode
            providerName="Google"
            className="NaturalLanguageProcessing"
            nodeId={id}
            renderAdditionalControls={renderAdditionalControls}
            renderAdditionalContent={renderAdditionalContent}
            theme={theme.google_ai}
        />
    );
}

export default memo(ProcessorNodeGoogleAI);
