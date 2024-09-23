import React, {memo} from 'react';
import theme from "./theme";
import BaseStateNode from "./BaseStateNode";
import BaseNode from "./BaseNode";
import BaseNode2 from "./BaseNode2";

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
        <BaseNode2
            nodeId={id}
            renderHeader={renderHeader}
            renderContent={renderContent}
            renderControls={renderControls}
            // renderAdditionalControls={renderAdditionalControls}
            // renderAdditionalContent={renderAdditionalContent}
            theme={theme.trainer}
        />
    );
}

export default memo(StateNode)