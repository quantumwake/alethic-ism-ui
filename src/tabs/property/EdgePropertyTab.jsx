import React, { useState, useEffect, useCallback } from "react";
import { useStore } from "../../store";
import { TerminalLabel, TerminalToggle, TerminalDropdown, TerminalTabViewSection, TemplateFieldWithEditor } from "../../components/common";

const FUNCTION_TYPES = [
    { id: 'CALIBRATOR', label: 'Calibrator - Retry with modifications' },
    { id: 'VALIDATOR', label: 'Validator - Pass/Drop based on rules' },
    { id: 'TRANSFORMER', label: 'Transformer - Modify data' },
    { id: 'FILTER', label: 'Filter - Conditional routing' },
];

const DEFAULT_CONFIG = {
    enabled: false,
    function_type: 'CALIBRATOR',
    template_id: null,
    max_attempts: 3,
    config: {}
};

const EdgePropertyTab = () => {
    const theme = useStore(state => state.getCurrentTheme());
    const { selectedEdgeId } = useStore();
    const { fetchEdgeFunctionConfig, updateEdgeFunctionConfig, templates, fetchTemplates, selectedProjectId } = useStore();

    const [config, setConfig] = useState(DEFAULT_CONFIG);
    const [isLoading, setIsLoading] = useState(false);

    const loadConfig = useCallback(async () => {
        if (!selectedEdgeId) return;
        setIsLoading(true);
        try {
            const existingConfig = await fetchEdgeFunctionConfig(selectedEdgeId);
            setConfig(existingConfig || DEFAULT_CONFIG);
        } catch (err) {
            console.error('Error fetching edge function config:', err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedEdgeId, fetchEdgeFunctionConfig]);

    useEffect(() => {
        if (selectedEdgeId) {
            loadConfig();
            if (selectedProjectId) {
                fetchTemplates(selectedProjectId);
            }
        }
    }, [selectedEdgeId, loadConfig, selectedProjectId, fetchTemplates]);

    const handleConfigChange = async (updates) => {
        const newConfig = { ...config, ...updates };
        setConfig(newConfig);

        // Auto-save on change
        try {
            await updateEdgeFunctionConfig(selectedEdgeId, newConfig);
        } catch (e) {
            console.error('Failed to save edge config:', e);
        }
    };

    const sections = {
        edgeFunction: {
            title: "Edge Function",
            items: {
                config: {
                    title: "",
                    content: (
                        <div className={`${theme.spacing.base} flex flex-col space-y-4`}>
                            <TerminalToggle
                                label="Enable Edge Function"
                                checked={config.enabled}
                                onChange={(enabled) => handleConfigChange({ enabled })}
                                disabled={isLoading}
                            />

                            <div>
                                <TerminalLabel description="Type of edge function behavior">
                                    Function Type
                                </TerminalLabel>
                                <TerminalDropdown
                                    values={FUNCTION_TYPES}
                                    onSelect={(value) => handleConfigChange({ function_type: value.id })}
                                    defaultValue={config.function_type}
                                    placeholder="Select function type"
                                />
                            </div>

                            <div>
                                <TerminalLabel description="Lua template that determines the action (PASS, RETRY, DROP)">
                                    Template
                                </TerminalLabel>
                                <TemplateFieldWithEditor
                                    templates={templates || []}
                                    selectedTemplateId={config.template_id ?? undefined}
                                    onSelect={(templateId) => handleConfigChange({ template_id: templateId })}
                                    placeholder="Select template"
                                    allowEmpty={true}
                                    projectId={selectedProjectId}
                                />
                            </div>

                            <div>
                                <TerminalLabel description="Maximum retry attempts before passing through">
                                    Max Attempts
                                </TerminalLabel>
                                <input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={config.max_attempts || 3}
                                    onChange={(e) => handleConfigChange({ max_attempts: parseInt(e.target.value) || 3 })}
                                    className={`w-full px-3 py-2 border ${theme.border} ${theme.bg} ${theme.text} font-mono text-sm focus:outline-none focus:border-amber-500`}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className={`text-xs font-mono p-3 border border-dashed ${theme.border} ${theme.text} opacity-70`}>
                                <div className="font-semibold mb-2">Lua Template Format:</div>
                                <pre className="text-xs">
{`-- Receives: data (map), attempt (int)
-- Returns: action, optional_data

if data.confidence < 0.8 and attempt < 3 then
    data.temperature = (data.temperature or 0.7) + 0.1
    return "RETRY", data
end

return "PASS", data`}
                                </pre>
                                <div className="mt-2">
                                    <span className="text-green-400">PASS</span> - continue to state |
                                    <span className="text-yellow-400 ml-1">RETRY</span> - send back to processor |
                                    <span className="text-red-400 ml-1">DROP</span> - discard
                                </div>
                            </div>
                        </div>
                    )
                }
            }
        }
    };

    if (!selectedEdgeId) {
        return null;
    }

    return (
        <>
            {Object.entries(sections).map(([key, section]) => (
                <TerminalTabViewSection
                    key={key}
                    title={section.title}
                    items={section.items}
                />
            ))}
        </>
    );
};

export default EdgePropertyTab;