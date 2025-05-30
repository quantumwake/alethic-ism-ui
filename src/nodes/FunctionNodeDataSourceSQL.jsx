import React, {memo} from 'react';
import BaseProcessorNode from "./base/BaseProcessorNode";

function FunctionNodeDataSourceSQL({ id, data }) {
    const renderAdditionalControls = ({ }) => (<>

    </>);

    const renderAdditionalContent = () => (<>

    </>);

    return (
        <BaseProcessorNode
            providerName="SQL"
            className="DatabaseProcessing"
            nodeId={id}
            renderAdditionalControls={renderAdditionalControls}
            renderAdditionalContent={renderAdditionalContent}
        />
    );
}

export default memo(FunctionNodeDataSourceSQL);
