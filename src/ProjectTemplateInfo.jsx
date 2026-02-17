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
                className="pr-0.5 focus:outline-none text-midnight-text-muted hover:text-midnight-accent-bright transition-colors"
                onClick={toggleTooltip}>
                <InformationCircleIcon className="w-6 h-6" />
            </button>
            {showTooltip && (
                <div className="absolute left-8 w-[400pt] bg-midnight-surface border border-midnight-border rounded-md shadow-midnight-glow p-4 z-[9999]">
                    <div className="text-sm text-midnight-text-body">
                        <p>Templates define how input data maps to structured output. Types include:</p>
                        <ol className="list-decimal list-inside mt-2 text-midnight-text-secondary">
                            <li>Python: Custom code processes input, returns output.</li>
                            <li>Mako: Text-based, renders dictionary input to prompts for models.</li>
                            <li>Others: Golang, routing templates, compute/GPU workloads.</li>
                        </ol>
                        <p className="mt-2">Process flow:</p>
                        <ol className="list-decimal list-inside mt-2 text-midnight-text-secondary">
                            <li>Input: Dictionary of values</li>
                            <li>Process: Function applies relevant template</li>
                            <li>Output: Rendered result, becomes input for next function</li>
                            <li>Repeat: Chain continues through defined paths</li>
                        </ol>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectTemplateInfo;