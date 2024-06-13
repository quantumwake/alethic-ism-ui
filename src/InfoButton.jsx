import React, { useState } from 'react';
import {InformationCircleIcon, ClipboardIcon} from "@heroicons/react/24/outline";

const InfoButton = ({ id, details }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const toggleTooltip = () => {
        setShowTooltip(!showTooltip);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(r => {});
    };

    return (
        <div className="info-button relative">
            <button
                className="pr-0.5 focus:outline-none"
                onClick={toggleTooltip}>
                <InformationCircleIcon className="w-4 h-4" />
            </button>
            {showTooltip && (
                <div className="absolute left-8 mt-2 w-96 bg-white border border-gray-300 rounded-md shadow-md p-2">
                    <p className="flex items-center">
                        ID: {id}
                        <button
                            className="ml-2 p-1 rounded-full hover:bg-gray-200 focus:outline-none"
                            onClick={() => copyToClipboard(id)}
                        >
                            <ClipboardIcon className="w-4 h-4 text-gray-500" />
                        </button>
                    </p>
                    <p className="flex items-center mt-1">
                        Details: {details}
                        <button
                            className="ml-2 p-1 rounded-full hover:bg-gray-200 focus:outline-none"
                            onClick={() => copyToClipboard(details)}
                        >
                            <ClipboardIcon className="w-4 h-4 text-gray-500" />
                        </button>
                    </p>
                </div>
            )}
        </div>
    );
};

export default InfoButton;