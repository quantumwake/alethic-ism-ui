import React, { useEffect, useState } from "react";
import { useStore } from "../../../store";
import { TerminalInput, TerminalLabel, TerminalCheckbox, TerminalDialogConfirmation } from "../../../components/common";
import { Plus, Trash2, RefreshCw } from "lucide-react";

function ProcessorStateTablesConfig({ nodeId }) {
    const theme = useStore(state => state.getCurrentTheme());
    const nodeData = useStore(state => state.getNodeData(nodeId));
    const setNodeData = useStore(state => state.setNodeData);
    const resetProcessorStateTable = useStore(state => state.resetProcessorStateTable);
    const [isResetting, setIsResetting] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    // Default values for state table configuration
    const defaultConfig = {
        tableName: "",
        includeTimestamp: true,
        indexColumns: [],
        batchSize: 1,
        batchWindowTTL: 0
    };

    // Initialize properties with defaults if they're empty or missing fields
    useEffect(() => {
        if (nodeData) {
            const currentProps = nodeData.properties || {};
            const needsUpdate = 
                !nodeData.properties || 
                Object.keys(nodeData.properties).length === 0 ||
                currentProps.includeTimestamp === undefined ||
                currentProps.batchSize === undefined ||
                currentProps.batchWindowTTL === undefined;
                
            if (needsUpdate) {
                setNodeData(nodeId, {
                    ...nodeData,
                    properties: {
                        tableName: currentProps.tableName || defaultConfig.tableName,
                        includeTimestamp: currentProps.includeTimestamp !== undefined ? currentProps.includeTimestamp : defaultConfig.includeTimestamp,
                        indexColumns: currentProps.indexColumns || defaultConfig.indexColumns,
                        batchSize: currentProps.batchSize !== undefined ? currentProps.batchSize : defaultConfig.batchSize,
                        batchWindowTTL: currentProps.batchWindowTTL !== undefined ? currentProps.batchWindowTTL : defaultConfig.batchWindowTTL
                    }
                });
            }
        }
    }, [nodeId, nodeData?.id]); // Add nodeData.id to re-run when node changes

    const properties = nodeData?.properties || {};
    const config = {
        tableName: properties.tableName || defaultConfig.tableName,
        includeTimestamp: properties.includeTimestamp !== undefined ? properties.includeTimestamp : defaultConfig.includeTimestamp,
        indexColumns: properties.indexColumns || defaultConfig.indexColumns,
        batchSize: properties.batchSize !== undefined ? properties.batchSize : defaultConfig.batchSize,
        batchWindowTTL: properties.batchWindowTTL !== undefined ? properties.batchWindowTTL : defaultConfig.batchWindowTTL
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
        if (!isNaN(numValue) && numValue >= 0) {
            handleUpdateProperty(field, numValue);
        }
    };

    const handleAddIndexColumn = () => {
        handleUpdateProperty("indexColumns", [...config.indexColumns, ""]);
    };

    const handleUpdateIndexColumn = (index, value) => {
        const updatedColumns = [...config.indexColumns];
        updatedColumns[index] = value;
        handleUpdateProperty("indexColumns", updatedColumns);
    };

    const handleRemoveIndexColumn = (index) => {
        const updatedColumns = config.indexColumns.filter((_, i) => i !== index);
        handleUpdateProperty("indexColumns", updatedColumns);
    };

    const handleResetTableData = async () => {
        setIsResetting(true);
        try {
            const response = await resetProcessorStateTable(nodeId);
            if (response.ok) {
                console.log("Table data has been reset successfully.");
            } else {
                console.error("Failed to reset table data");
            }
        } catch (error) {
            console.error("Error resetting table data:", error);
        } finally {
            setIsResetting(false);
            setShowResetConfirm(false);
        }
    };

    return (
        <div className={`${theme.spacing.base} flex flex-col space-y-4`}>
            <div className={`${theme.text} ${theme.font} text-sm opacity-75 mb-2`}>
                Configure state table for data persistence and processing.
            </div>

            {/* Table Configuration */}
            <div className="space-y-4 p-3 border border-opacity-50">
                <div className={`${theme.text} ${theme.font} font-semibold`}>
                    Table Configuration
                </div>
                
                <div className="space-y-2">
                    <TerminalLabel description="Table name suffix for this processor">
                        Table Name
                    </TerminalLabel>
                    <TerminalInput
                        value={config.tableName}
                        onChange={(e) => handleUpdateProperty("tableName", e.target.value)}
                        placeholder="e.g., events_processed"
                    />
                </div>

                <TerminalCheckbox
                    checked={config.includeTimestamp}
                    onChange={(e) => handleUpdateProperty("includeTimestamp", e.target.checked)}
                    label="Include timestamp on every record insertion"
                />
            </div>

            {/* Index Columns */}
            <div className="space-y-4 p-3 border border-opacity-50">
                <div className={`${theme.text} ${theme.font} font-semibold flex items-center justify-between`}>
                    <span>Index Columns</span>
                    <button
                        onClick={handleAddIndexColumn}
                        className={`px-2 py-1 text-xs ${theme.button.primary} flex items-center gap-1`}
                    >
                        <Plus className="w-3 h-3" />
                        Add Index
                    </button>
                </div>

                <div className="space-y-2">
                    {config.indexColumns.length === 0 ? (
                        <div className={`${theme.text} ${theme.font} text-sm opacity-50 text-center py-2`}>
                            No index columns defined
                        </div>
                    ) : (
                        config.indexColumns.map((column, index) => (
                            <div key={index} className="flex gap-2">
                                <TerminalInput
                                    value={column}
                                    onChange={(e) => handleUpdateIndexColumn(index, e.target.value)}
                                    placeholder="Column name"
                                    className="flex-1"
                                />
                                <button
                                    onClick={() => handleRemoveIndexColumn(index)}
                                    className={`px-2 py-1 text-xs ${theme.button.danger} hover:opacity-80`}
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Batch Configuration */}
            <div className="space-y-4 p-3 border border-opacity-50">
                <div className={`${theme.text} ${theme.font} font-semibold`}>
                    Batch Configuration
                </div>
                
                <div className="space-y-2">
                    <TerminalLabel description="Number of records to batch before writing (1 = instant write)">
                        Batch Size
                    </TerminalLabel>
                    <TerminalInput
                        type="number"
                        value={config.batchSize}
                        onChange={(e) => handleNumberInput("batchSize", e.target.value)}
                        placeholder="1"
                        min="1"
                    />
                </div>

                <div className="space-y-2">
                    <TerminalLabel description="Time in seconds before flushing batch (0 = disabled/instant)">
                        Batch Window TTL (seconds)
                    </TerminalLabel>
                    <TerminalInput
                        type="number"
                        value={config.batchWindowTTL}
                        onChange={(e) => handleNumberInput("batchWindowTTL", e.target.value)}
                        placeholder="0"
                        min="0"
                    />
                    <div className={`${theme.text} ${theme.font} text-xs opacity-50`}>
                        {config.batchWindowTTL === 0 
                            ? "Instant mode - writes immediately" 
                            : `Batch will flush after ${config.batchWindowTTL} seconds`}
                    </div>
                </div>
            </div>

            {/* Data Management */}
            <div className="space-y-4 p-3 border border-opacity-50">
                <div className={`${theme.text} ${theme.font} font-semibold`}>
                    Data Management
                </div>
                
                <button
                    onClick={() => setShowResetConfirm(true)}
                    disabled={isResetting}
                    className={`px-4 py-2 text-sm ${theme.button.danger} flex items-center gap-2 w-full justify-center`}
                >
                    <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
                    {isResetting ? 'Resetting...' : 'Reset Table Data'}
                </button>
                <div className={`${theme.text} ${theme.font} text-xs opacity-50`}>
                    Warning: This will delete all data in the table
                </div>
            </div>

            {/* Help Text */}
            <div className={`${theme.text} ${theme.font} text-xs opacity-50 mt-4 p-3 border border-dashed border-opacity-30`}>
                <div className="font-semibold mb-1">Configuration Notes:</div>
                <ul className="list-disc list-inside space-y-1">
                    <li>Batch size of 1 writes immediately; higher values improve performance</li>
                    <li>Batch TTL ensures data is written even with small batches</li>
                    <li>Index columns improve query performance but increase write time</li>
                    <li>Timestamp tracking helps with data auditing and debugging</li>
                </ul>
            </div>

            {/* Reset Confirmation Dialog */}
            <TerminalDialogConfirmation
                isOpen={showResetConfirm}
                onAccept={handleResetTableData}
                onCancel={() => setShowResetConfirm(false)}
                onClose={() => setShowResetConfirm(false)}
                title="Reset State Table Data"
                content="This process is irreversible. Are you sure you wish to delete all data within this state table?"
            />
        </div>
    );
}

export default ProcessorStateTablesConfig;