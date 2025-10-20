import React, { useEffect } from "react";
import { useStore } from "../../../store";
import { TerminalInput, TerminalLabel } from "../../../components/common";

function ProcessorBaseConfig({ nodeId }) {
    const theme = useStore(state => state.getCurrentTheme());
    const nodeData = useStore(state => state.getNodeData(nodeId));
    const setNodeData = useStore(state => state.setNodeData);

    // Default values for base processor configuration
    const defaultConfig = {
        maxBatchSize: 100,
        maxBatchLimit: 1
    };

    // Initialize properties with defaults if they're empty or missing fields
    useEffect(() => {
        if (nodeData) {
            const currentProps = nodeData.properties || {};
            const needsUpdate =
                !nodeData.properties ||
                Object.keys(nodeData.properties).length === 0 ||
                currentProps.maxBatchSize === undefined ||
                currentProps.maxBatchLimit === undefined;

            if (needsUpdate) {
                setNodeData(nodeId, {
                    ...nodeData,
                    properties: {
                        ...currentProps,
                        maxBatchSize: currentProps.maxBatchSize !== undefined ? currentProps.maxBatchSize : defaultConfig.maxBatchSize,
                        maxBatchLimit: currentProps.maxBatchLimit !== undefined ? currentProps.maxBatchLimit : defaultConfig.maxBatchLimit
                    }
                });
            }
        }
    }, [nodeId, nodeData?.id]);

    const properties = nodeData?.properties || {};
    const config = {
        maxBatchSize: properties.maxBatchSize !== undefined ? properties.maxBatchSize : defaultConfig.maxBatchSize,
        maxBatchLimit: properties.maxBatchLimit !== undefined ? properties.maxBatchLimit : defaultConfig.maxBatchLimit
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

    const handleNumberInput = (field, value) => {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue > 0) {
            handleUpdateProperty(field, numValue);
        }
    };

    return (
        <div className={`${theme.spacing.base} flex flex-col space-y-4`}>
            <div className={`${theme.text} ${theme.font} text-sm opacity-75 mb-2`}>
                Configure batch limits for state routing operations (when playing an edge/route).
            </div>

            {/* State Routing Configuration */}
            <div className="space-y-4 p-3 border border-opacity-50">
                <div className={`${theme.text} ${theme.font} font-semibold`}>
                    State Routing Batch Limits
                </div>

                <div className="space-y-2">
                    <TerminalLabel description="Maximum records to load from input state in a single batch query">
                        Max Batch Load Size
                    </TerminalLabel>
                    <TerminalInput
                        type="number"
                        value={config.maxBatchSize}
                        onChange={(e) => handleNumberInput("maxBatchSize", e.target.value)}
                        placeholder="100"
                        min="1"
                    />
                    <div className={`${theme.text} ${theme.font} text-xs opacity-50`}>
                        Hard limit - not a threshold. Routes whatever is available up to this limit.
                    </div>
                </div>

                <div className="space-y-2">
                    <TerminalLabel description="Maximum records to forward to processor in a single event">
                        Max Batch Forward Limit
                    </TerminalLabel>
                    <TerminalInput
                        type="number"
                        value={config.maxBatchLimit}
                        onChange={(e) => handleNumberInput("maxBatchLimit", e.target.value)}
                        placeholder="1"
                        min="1"
                    />
                    <div className={`${theme.text} ${theme.font} text-xs opacity-50`}>
                        Hard limit - processor receives up to this many records per event.
                    </div>
                </div>
            </div>

            {/* Help Text */}
            <div className={`${theme.text} ${theme.font} text-xs opacity-50 mt-4 p-3 border border-dashed border-opacity-30`}>
                <div className="font-semibold mb-1">State Routing Flow:</div>
                <ul className="list-disc list-inside space-y-1">
                    <li>When playing an edge: Input State → Processor → Output State(s)</li>
                    <li>Max Batch Load Size: Loads up to N records from input state per query</li>
                    <li>Max Batch Forward Limit: Forwards up to M records to processor per event</li>
                    <li>Example: Load 100, Forward 1 = processor receives 100 events (1 record each)</li>
                    <li>Example: Load 1000, Forward 100 = processor receives 10 events (100 records each)</li>
                    <li>These are HARD LIMITS, not thresholds - will forward even 1 event if that's all available</li>
                    <li>Larger load sizes reduce DB queries; smaller forward limits provide better processing control</li>
                </ul>
            </div>
        </div>
    );
}

export default ProcessorBaseConfig;