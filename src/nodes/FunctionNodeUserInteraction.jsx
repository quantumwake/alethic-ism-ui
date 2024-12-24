import React, {memo} from 'react';
import theme from "./theme";
import BaseProcessorNode from "./base/BaseProcessorNode";

function FunctionNodeUserInteraction({ id, data }) {
    const renderAdditionalControls = ({}) => (<>

    </>);

    const openInteraction = async(e) => {
        let filters = "?filters=%5B%7B\"filters\"%3A%5B%7B\"column\"%3A\"animal\"%2C\"operator\"%3A\"%3D\"%2C\"value\"%3A\"dog\"%7D%5D%2C\"group_logic\"%3A\"AND\"%7D%5D"
        openInNewTab(`${window.env.REACT_APP_ISM_USER_INTERACTION_BASE_URL}/${id}?${filters}`)
    }

    const openInNewTab = (url) => {
        try {
            if (typeof url !== "string" || !url.startsWith("http")) {
                throw new Error("Invalid URL provided.");
            }

            // open the URL in a new tab
            window.open(url, "_blank", "noopener,noreferrer");
        } catch (error) {
            console.error("Error opening new tab:", error);
        }
    };


    const renderAdditionalContent = () => (<>
        <a onClick={(e) => openInteraction(e)}>Interact</a>
    </>);

    return (
        <BaseProcessorNode
            providerName="User Interaction"
            className="Interaction"
            nodeId={id}
            renderAdditionalControls={renderAdditionalControls}
            renderAdditionalContent={renderAdditionalContent}
            theme={theme.user_input}
        />
    );
}

export default memo(FunctionNodeUserInteraction);
