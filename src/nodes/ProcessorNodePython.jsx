import React, {memo} from 'react';
import BaseProcessorNode from "./base/BaseProcessorNode";

function ProcessorNodePython({ id, data }) {
    const renderAdditionalControls = ({}) => (<>

    </>);

    const renderAdditionalContent = () => (<>

    </>);

    return (
        <BaseProcessorNode
            providerName="Python Executor"
            className="CodeProcessing"
            nodeId={id}
            renderAdditionalControls={renderAdditionalControls}
            renderAdditionalContent={renderAdditionalContent}
        />
    );
}

export default memo(ProcessorNodePython);
