import React, {memo} from 'react';
import BaseNode from "./base/BaseNode";

function StateNode({ id, data }) {
    const renderHeader = () => (<>
        Model Trainer
    </>);

    const renderContent = () => (<>
        Hello World
    </>);

    const renderControls = () => (<>

    </>);

    return (
        <BaseNode
            nodeId={id}
            renderHeader={renderHeader}
            renderContent={renderContent}
            renderControls={renderControls}
            // renderAdditionalControls={renderAdditionalControls}
            // renderAdditionalContent={renderAdditionalContent}
        />
    );
}

export default memo(StateNode)