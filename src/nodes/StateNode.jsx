import React, {memo} from 'react';
import BaseStateNode from "./base/BaseStateNode";

function StateNode({ id, data }) {
    const renderAdditionalControls = () => (<>

    </>);

    const renderAdditionalContent = () => (<>

    </>);

    return (
        <BaseStateNode
            nodeId={id}
            renderAdditionalControls={renderAdditionalControls}
            renderAdditionalContent={renderAdditionalContent}
        />
    );
}

export default memo(StateNode)