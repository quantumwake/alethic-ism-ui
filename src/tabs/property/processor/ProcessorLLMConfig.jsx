import React, { useEffect, useState } from "react";
import { useStore } from "../../../store";
import { TerminalInput, TerminalLabel, TerminalCheckbox } from "../../../components/common";

function ProcessorLLMConfig({ nodeId }) {
    const theme = useStore(state => state.getCurrentTheme());
    const nodeData = useStore(state => state.getNodeData(nodeId));
    const setNodeData = useStore(state => state.setNodeData);

    // Default values for LLM configuration
    const defaultConfig = {
        temperature: 0.7,
        requestDelay: 0,
        repeatPenalty: 1.0,
        maxTokens: 2048,
        topP: 1.0,
        topK: 0,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
        overrideBaseUrl: null,
    };

    // Initialize properties with defaults if they're empty or missing fields
    useEffect(() => {
        if (nodeData) {
            const currentProps = nodeData.properties || {};
            const needsUpdate =
                !nodeData.properties ||
                Object.keys(nodeData.properties).length === 0 ||
                currentProps.temperature === undefined ||
                currentProps.requestDelay === undefined ||
                currentProps.repeatPenalty === undefined;

            if (needsUpdate) {
                setNodeData(nodeId, {
                    ...nodeData,
                    properties: {
                        temperature: currentProps.temperature !== undefined ? currentProps.temperature : defaultConfig.temperature,
                        requestDelay: currentProps.requestDelay !== undefined ? currentProps.requestDelay : defaultConfig.requestDelay,
                        repeatPenalty: currentProps.repeatPenalty !== undefined ? currentProps.repeatPenalty : defaultConfig.repeatPenalty,
                        maxTokens: currentProps.maxTokens !== undefined ? currentProps.maxTokens : defaultConfig.maxTokens,
                        topP: currentProps.topP !== undefined ? currentProps.topP : defaultConfig.topP,
                        topK: currentProps.topK !== undefined ? currentProps.topK : defaultConfig.topK,
                        frequencyPenalty: currentProps.frequencyPenalty !== undefined ? currentProps.frequencyPenalty : defaultConfig.frequencyPenalty,
                        presencePenalty: currentProps.presencePenalty !== undefined ? currentProps.presencePenalty : defaultConfig.presencePenalty,
                        overrideBaseUrl: currentProps.overrideBaseUrl !== undefined ? currentProps.overrideBaseUrl : defaultConfig.overrideBaseUrl
                    }
                });
            }
        }
    }, [nodeId, nodeData?.id]);

    const properties = nodeData?.properties || {};
    const config = {
        temperature: properties.temperature !== undefined ? properties.temperature : defaultConfig.temperature,
        requestDelay: properties.requestDelay !== undefined ? properties.requestDelay : defaultConfig.requestDelay,
        repeatPenalty: properties.repeatPenalty !== undefined ? properties.repeatPenalty : defaultConfig.repeatPenalty,
        maxTokens: properties.maxTokens !== undefined ? properties.maxTokens : defaultConfig.maxTokens,
        topP: properties.topP !== undefined ? properties.topP : defaultConfig.topP,
        topK: properties.topK !== undefined ? properties.topK : defaultConfig.topK,
        frequencyPenalty: properties.frequencyPenalty !== undefined ? properties.frequencyPenalty : defaultConfig.frequencyPenalty,
        presencePenalty: properties.presencePenalty !== undefined ? properties.presencePenalty : defaultConfig.presencePenalty,
        overrideBaseUrl: properties.overrideBaseUrl !== undefined ? properties.overrideBaseUrl : defaultConfig.overrideBaseUrl,
    };

    const handleUpdateProperty = (field, value) => {
        const currentProperties = nodeData?.properties || {};
        const updatedProperties = {
            ...currentProperties,
            [field]: value
        };

        setNodeData(nodeId, {
            ...nodeData,
            properties: updatedProperties
        });
    };

    const handleFloatInput = (field, value, min = 0, max = null) => {
        const floatValue = parseFloat(value);
        if (!isNaN(floatValue) && floatValue >= min && (max === null || floatValue <= max)) {
            handleUpdateProperty(field, floatValue);
        }
    };

    const handleIntInput = (field, value, min = 0) => {
        const intValue = parseInt(value, 10);
        if (!isNaN(intValue) && intValue >= min) {
            handleUpdateProperty(field, intValue);
        }
    };

    return (
        <div className={`${theme.spacing.base} flex flex-col space-y-4`}>
            <div className={`${theme.text} ${theme.font} text-sm opacity-75 mb-2`}>
                Configure LLM parameters for model behavior and request throttling.
            </div>

            {/* Sampling Parameters */}
            <div className="space-y-4 p-3 border border-opacity-50">
                <div className={`${theme.text} ${theme.font} font-semibold`}>
                    Sampling Parameters
                </div>

                <div className="space-y-2">
                    <TerminalLabel description="Controls randomness in output (0.0 = deterministic, 2.0 = very random)">
                        Temperature
                    </TerminalLabel>
                    <TerminalInput
                        type="number"
                        value={config.temperature}
                        onChange={(e) => handleFloatInput("temperature", e.target.value, 0, 2)}
                        placeholder="0.7"
                        step="0.1"
                        min="0"
                        max="2"
                    />
                    <div className={`${theme.text} ${theme.font} text-xs opacity-50`}>
                        Current: {config.temperature.toFixed(2)}
                    </div>
                </div>

                <div className="space-y-2">
                    <TerminalLabel description="Nucleus sampling - probability mass to consider (0.0-1.0)">
                        Top P
                    </TerminalLabel>
                    <TerminalInput
                        type="number"
                        value={config.topP}
                        onChange={(e) => handleFloatInput("topP", e.target.value, 0, 1)}
                        placeholder="1.0"
                        step="0.05"
                        min="0"
                        max="1"
                    />
                    <div className={`${theme.text} ${theme.font} text-xs opacity-50`}>
                        Current: {config.topP.toFixed(2)}
                    </div>
                </div>

                <div className="space-y-2">
                    <TerminalLabel description="Top-k sampling - number of tokens to consider (0 = disabled)">
                        Top K
                    </TerminalLabel>
                    <TerminalInput
                        type="number"
                        value={config.topK}
                        onChange={(e) => handleIntInput("topK", e.target.value, 0)}
                        placeholder="0"
                        min="0"
                    />
                    <div className={`${theme.text} ${theme.font} text-xs opacity-50`}>
                        {config.topK === 0 ? "Disabled" : `Top ${config.topK} tokens`}
                    </div>
                </div>

                <div className="space-y-2">
                    <TerminalLabel description="Maximum tokens to generate in response">
                        Max Tokens
                    </TerminalLabel>
                    <TerminalInput
                        type="number"
                        value={config.maxTokens}
                        onChange={(e) => handleIntInput("maxTokens", e.target.value, 1)}
                        placeholder="2048"
                        min="1"
                    />
                </div>
            </div>

            {/* Penalty Parameters */}
            <div className="space-y-4 p-3 border border-opacity-50">
                <div className={`${theme.text} ${theme.font} font-semibold`}>
                    Penalty Parameters
                </div>

                <div className="space-y-2">
                    <TerminalLabel description="Penalty for repeating tokens (1.0 = no penalty, higher = less repetition)">
                        Repeat Penalty
                    </TerminalLabel>
                    <TerminalInput
                        type="number"
                        value={config.repeatPenalty}
                        onChange={(e) => handleFloatInput("repeatPenalty", e.target.value, 0, 2)}
                        placeholder="1.0"
                        step="0.1"
                        min="0"
                        max="2"
                    />
                    <div className={`${theme.text} ${theme.font} text-xs opacity-50`}>
                        Current: {config.repeatPenalty.toFixed(2)}
                    </div>
                </div>

                <div className="space-y-2">
                    <TerminalLabel description="Penalize tokens based on frequency (-2.0 to 2.0)">
                        Frequency Penalty
                    </TerminalLabel>
                    <TerminalInput
                        type="number"
                        value={config.frequencyPenalty}
                        onChange={(e) => handleFloatInput("frequencyPenalty", e.target.value, -2, 2)}
                        placeholder="0.0"
                        step="0.1"
                        min="-2"
                        max="2"
                    />
                    <div className={`${theme.text} ${theme.font} text-xs opacity-50`}>
                        Current: {config.frequencyPenalty.toFixed(2)}
                    </div>
                </div>

                <div className="space-y-2">
                    <TerminalLabel description="Penalize tokens based on presence (-2.0 to 2.0)">
                        Presence Penalty
                    </TerminalLabel>
                    <TerminalInput
                        type="number"
                        value={config.presencePenalty}
                        onChange={(e) => handleFloatInput("presencePenalty", e.target.value, -2, 2)}
                        placeholder="0.0"
                        step="0.1"
                        min="-2"
                        max="2"
                    />
                    <div className={`${theme.text} ${theme.font} text-xs opacity-50`}>
                        Current: {config.presencePenalty.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Request Throttling */}
            <div className="space-y-4 p-3 border border-opacity-50">
                <div className={`${theme.text} ${theme.font} font-semibold`}>
                    Request Throttling
                </div>

                <div className="space-y-2">
                    <TerminalLabel description="Delay between requests in milliseconds (0 = no delay)">
                        Request Delay (ms)
                    </TerminalLabel>
                    <TerminalInput
                        type="number"
                        value={config.requestDelay}
                        onChange={(e) => handleIntInput("requestDelay", e.target.value, 0)}
                        placeholder="0"
                        min="0"
                    />
                    <div className={`${theme.text} ${theme.font} text-xs opacity-50`}>
                        {config.requestDelay === 0
                            ? "No throttling"
                            : `${(config.requestDelay / 1000).toFixed(2)}s delay between requests`}
                    </div>
                </div>
            </div>

            {/* Base URL override */}
            <div className="space-y-4 p-3 border border-opacity-50">
                <div className={`${theme.text} ${theme.font} font-semibold`}>
                    Override Base URL
                </div>

                <div className="space-y-2">
                    <TerminalLabel description="leave blank for default provider base url">
                        Base url used for generating content (e.g. OpenAI chat completion)
                    </TerminalLabel>
                    <TerminalInput
                        type="number"
                        value={config.overrideBaseUrl}
                        onChange={(e) => handleIntInput("overrideBaseUrlgit stat", e.target.value, 0)}
                        placeholder="0"
                        min="0"
                    />
                    <div className={`${theme.text} ${theme.font} text-xs opacity-50`}>
                        {config.requestDelay === 0
                            ? "No throttling"
                            : `${(config.requestDelay / 1000).toFixed(2)}s delay between requests`}
                    </div>
                </div>
            </div>

            {/* Help Text */}
            <div className={`${theme.text} ${theme.font} text-xs opacity-50 mt-4 p-3 border border-dashed border-opacity-30`}>
                <div className="font-semibold mb-1">Configuration Notes:</div>
                <ul className="list-disc list-inside space-y-1">
                    <li>Temperature: Higher values = more creative, lower = more focused</li>
                    <li>Top P/K: Controls diversity of generated tokens</li>
                    <li>Repeat Penalty: Reduces repetitive outputs</li>
                    <li>Frequency/Presence Penalties: Fine-tune repetition control</li>
                    <li>Request Delay: Use to avoid rate limiting or control costs</li>
                </ul>
            </div>
        </div>
    );
}

export default ProcessorLLMConfig;