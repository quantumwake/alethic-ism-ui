import React, {memo} from 'react';
import theme from "./theme";
import BaseStateNode from "./BaseStateNode";

function StateNode({ id, data }) {
    const renderAdditionalControls = () => (<>

    </>);

    const renderAdditionalContent = () => (<>

    </>);

    return (
        <BaseStateNode
            providerName="Python Executor"
            nodeId={id}
            renderAdditionalControls={renderAdditionalControls}
            renderAdditionalContent={renderAdditionalContent}
            theme={theme.state}
        />
    );
}

export default memo(StateNode)