import React, {memo} from 'react';
import BaseProcessorNode from "./base/BaseProcessorNode";

function ProcessorNodeQuantumWakeStateFuser({ id, data }) {
    const renderAdditionalControls = ({ }) => (<>

    </>);

    const renderAdditionalContent = () => (<>

    </>);

    return (
        <BaseProcessorNode
            providerName="State Coalescer"
            className="DataTransformation"
            nodeId={id}
            renderAdditionalControls={renderAdditionalControls}
            renderAdditionalContent={renderAdditionalContent}
        />
    );
}

export default memo(ProcessorNodeQuantumWakeStateFuser);
