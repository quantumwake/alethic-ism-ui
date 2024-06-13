import React, {memo} from 'react';
import theme from "./theme";
import BaseProcessorNode from "./BaseProcessorNode";

function ProcessorNodePython({ id, data }) {
    const renderAdditionalControls = ({ setIsOpenConfig }) => (<>

    </>);

    const renderAdditionalContent = () => (<>

    </>);

    return (
        <BaseProcessorNode
            providerName="Python Executor"
            nodeId={id}
            renderAdditionalControls={renderAdditionalControls}
            renderAdditionalContent={renderAdditionalContent}
            theme={theme.python}
        />
    );
}

export default memo(ProcessorNodePython);
