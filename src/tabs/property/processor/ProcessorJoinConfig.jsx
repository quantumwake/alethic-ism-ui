import React, { useEffect } from "react";
import { useStore } from "../../../store";
import { TerminalInput, TerminalLabel } from "../../../components/common";

function ProcessorJoinConfig({ nodeId }) {
    const theme = useStore(state => state.getCurrentTheme());
    const nodeData = useStore(state => state.getNodeData(nodeId));
    const setNodeData = useStore(state => state.setNodeData);

    // Default values for join processor configuration
    const defaultConfig = {
        blockCountSoftLimit: 10,
        blockWindowTTL: "1m",
        blockPartMaxJoinCount: 1,
        blockPartMaxAge: "15s"
    };

    // Initialize properties with defaults if they're empty
    useEffect(() => {
        if (nodeData && (!nodeData.properties || Object.keys(nodeData.properties).length === 0)) {
            setNodeData(nodeId, {
                ...nodeData,
                properties: defaultConfig
            });
        }
    }, [nodeId]); // Only run when nodeId changes

    // Always use the current values if they exist, otherwise use defaults
    // This ensures the form always displays with either saved or default values
    const properties = nodeData?.properties || {};
    const config = {
        blockCountSoftLimit: properties.blockCountSoftLimit !== undefined ? properties.blockCountSoftLimit : defaultConfig.blockCountSoftLimit,
        blockWindowTTL: properties.blockWindowTTL || defaultConfig.blockWindowTTL,
        blockPartMaxJoinCount: properties.blockPartMaxJoinCount !== undefined ? properties.blockPartMaxJoinCount : defaultConfig.blockPartMaxJoinCount,
        blockPartMaxAge: properties.blockPartMaxAge || defaultConfig.blockPartMaxAge
    };

    const handleUpdateProperty = (field, value) => {
        // Ensure all default values are included along with the update
        const currentProperties = nodeData?.properties || {};
        const updatedProperties = {
            blockCountSoftLimit: currentProperties.blockCountSoftLimit !== undefined ? currentProperties.blockCountSoftLimit : defaultConfig.blockCountSoftLimit,
            blockWindowTTL: currentProperties.blockWindowTTL || defaultConfig.blockWindowTTL,
            blockPartMaxJoinCount: currentProperties.blockPartMaxJoinCount !== undefined ? currentProperties.blockPartMaxJoinCount : defaultConfig.blockPartMaxJoinCount,
            blockPartMaxAge: currentProperties.blockPartMaxAge || defaultConfig.blockPartMaxAge,
            [field]: value  // Override with the new value
        };
        
        setNodeData(nodeId, {
            ...nodeData,
            properties: updatedProperties
        });
    };

    const handleNumberInput = (field, value) => {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue >= 0) {
            handleUpdateProperty(field, numValue);
        }
    };

    return (
        <div className={`${theme.spacing.base} flex flex-col space-y-4`}>
            <div className={`${theme.text} ${theme.font} text-sm opacity-75 mb-2`}>
                Configure the sliding window behavior for data correlation and joining.
            </div>

            {/* Block Configuration */}
            <div className="space-y-4 p-3 border border-opacity-50">
                <div className={`${theme.text} ${theme.font} font-semibold`}>
                    Block Configuration
                </div>
                
                <div className="space-y-2">
                    <TerminalLabel description="Maximum number of blocks before eviction starts">
                        Block Count Soft Limit
                    </TerminalLabel>
                    <TerminalInput
                        type="number"
                        value={config.blockCountSoftLimit}
                        onChange={(e) => handleNumberInput("blockCountSoftLimit", e.target.value)}
                        placeholder="10"
                        min="1"
                    />
                </div>

                <div className="space-y-2">
                    <TerminalLabel description="Sliding window TTL for blocks (e.g., 1m, 5m, 1h)">
                        Block Window TTL
                    </TerminalLabel>
                    <TerminalInput
                        value={config.blockWindowTTL}
                        onChange={(e) => handleUpdateProperty("blockWindowTTL", e.target.value)}
                        placeholder="1m"
                        pattern="^\d+[smh]$"
                    />
                    <div className={`${theme.text} ${theme.font} text-xs opacity-50`}>
                        Format: number + unit (s=seconds, m=minutes, h=hours)
                    </div>
                </div>
            </div>

            {/* Block Part Configuration */}
            <div className="space-y-4 p-3 border border-opacity-50">
                <div className={`${theme.text} ${theme.font} font-semibold`}>
                    Block Part Configuration
                </div>
                
                <div className="space-y-2">
                    <TerminalLabel description="Maximum number of joins allowed per data part">
                        Max Join Count
                    </TerminalLabel>
                    <TerminalInput
                        type="number"
                        value={config.blockPartMaxJoinCount}
                        onChange={(e) => handleNumberInput("blockPartMaxJoinCount", e.target.value)}
                        placeholder="1"
                        min="1"
                    />
                </div>

                <div className="space-y-2">
                    <TerminalLabel description="Absolute lifetime of a data part (e.g., 15s, 30s, 1m)">
                        Block Part Max Age
                    </TerminalLabel>
                    <TerminalInput
                        value={config.blockPartMaxAge}
                        onChange={(e) => handleUpdateProperty("blockPartMaxAge", e.target.value)}
                        placeholder="15s"
                        pattern="^\d+[smh]$"
                    />
                    <div className={`${theme.text} ${theme.font} text-xs opacity-50`}>
                        Parts are evicted after this duration regardless of activity
                    </div>
                </div>
            </div>

            {/* Help Text */}
            <div className={`${theme.text} ${theme.font} text-xs opacity-50 mt-4 p-3 border border-dashed border-opacity-30`}>
                <div className="font-semibold mb-1">How it works:</div>
                <ul className="list-disc list-inside space-y-1">
                    <li>Blocks group events by join key and reset their TTL on each new event</li>
                    <li>Block parts are individual events within a block with fixed lifetimes</li>
                    <li>Parts expire based on age OR join count, whichever comes first</li>
                    <li>Blocks are evicted when idle for the window TTL and count exceeds soft limit</li>
                </ul>
            </div>
        </div>
    );
}

export default ProcessorJoinConfig;