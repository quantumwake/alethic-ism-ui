import React, { useState } from 'react';
import { InformationCircleIcon, ClipboardIcon } from "@heroicons/react/24/outline";

const ProjectTemplateInfo = ({ details }) => {
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
                <InformationCircleIcon className="w-6 h-6" />
            </button>
            {showTooltip && (
                <div className="absolute left-8 w-[400pt] bg-white border border-gray-300 rounded-md shadow-md p-4 z-[9999]">
                    <p className="flex items-center mt-1">
                        <div className="text-sm text-gray-600">
                            <p>Templates define how input data maps to structured output. Types include:</p>
                            <ol className="list-decimal list-inside mt-2">
                                <li>Python: Custom code processes input, returns output.</li>
                                <li>Mako: Text-based, renders dictionary input to prompts for models.</li>
                                <li>Others: Golang, routing templates, compute/GPU workloads.</li>
                            </ol>
                            <p className="mt-2">Process flow:</p>
                            <ol className="list-decimal list-inside mt-2">
                                <li>Input: Dictionary of values</li>
                                <li>Process: Function applies relevant template</li>
                                <li>Output: Rendered result, becomes input for next function</li>
                                <li>Repeat: Chain continues through defined paths</li>
                            </ol>
                        </div>
                    </p>
                </div>
            )}
        </div>
    );
};

export default ProjectTemplateInfo;