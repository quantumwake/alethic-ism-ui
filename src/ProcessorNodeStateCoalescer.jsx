import React, {memo} from 'react';
import theme from "./theme";
import BaseProcessorNode from "./BaseProcessorNode";

function ProcessorNodeQuantumWakeStateFuser({ id, data }) {
    const renderAdditionalControls = ({ setIsOpenConfig }) => (<>

    </>);

    const renderAdditionalContent = () => (<>

    </>);

    return (
        <BaseProcessorNode
            providerName="State Coalescer"
            nodeId={id}
            renderAdditionalControls={renderAdditionalControls}
            renderAdditionalContent={renderAdditionalContent}
            theme={theme.quantumwake}
        />
    );
}

export default memo(ProcessorNodeQuantumWakeStateFuser);
