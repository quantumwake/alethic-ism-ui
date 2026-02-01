import React, { useState, useEffect, memo, useCallback } from 'react';
import { TerminalDialog, TerminalButton, TerminalToggle, TerminalLabel, TemplateFieldWithEditor, TerminalDropdown } from "../common";
import { useStore } from '../../store';

type EdgeFunctionType = 'CALIBRATOR' | 'VALIDATOR' | 'TRANSFORMER' | 'FILTER';

interface EdgeFunctionConfig {
    enabled: boolean;
    function_type: EdgeFunctionType;
    template_id?: string | null;
    max_attempts?: number;
    config?: Record<string, any>;
}

const FUNCTION_TYPES = [
    { id: 'CALIBRATOR', label: 'Calibrator - Retry with modifications' },
    { id: 'VALIDATOR', label: 'Validator - Pass/Drop based on rules' },
    { id: 'TRANSFORMER', label: 'Transformer - Modify data' },
    { id: 'FILTER', label: 'Filter - Conditional routing' },
];

const DEFAULT_CONFIG: EdgeFunctionConfig = {
    enabled: false,
    function_type: 'CALIBRATOR',
    template_id: null,
    max_attempts: 3,
    config: {}
};

interface TerminalEdgeFunctionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    routeId: string;
}

const TerminalEdgeFunctionDialog = memo<TerminalEdgeFunctionDialogProps>(({ isOpen, onClose, routeId }) => {
    const theme = useStore((state: any) => state.getCurrentTheme());
    const { fetchEdgeFunctionConfig, updateEdgeFunctionConfig, templates, fetchTemplates, selectedProjectId } = useStore();

    const [config, setConfig] = useState<EdgeFunctionConfig>(DEFAULT_CONFIG);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const loadConfig = useCallback(async () => {
        if (!routeId) return;

        setIsLoading(true);
        setError('');

        try {
            const existingConfig = await fetchEdgeFunctionConfig(routeId);
            setConfig(existingConfig || DEFAULT_CONFIG);
        } catch (err) {
            console.error('Error fetching edge function config:', err);
            setError('Failed to load configuration');
        } finally {
            setIsLoading(false);
        }
    }, [routeId, fetchEdgeFunctionConfig]);

    useEffect(() => {
        if (isOpen) {
            loadConfig();
            if (selectedProjectId) {
                fetchTemplates(selectedProjectId);
            }
        }
    }, [isOpen, loadConfig, selectedProjectId, fetchTemplates]);

    const handleClose = useCallback(() => {
        setError('');
        setConfig(DEFAULT_CONFIG);
        onClose();
    }, [onClose]);

    const handleSave = useCallback(async () => {
        setError('');
        setIsLoading(true);

        try {
            const result = await updateEdgeFunctionConfig(routeId, config);
            if (result) {
                handleClose();
            } else {
                setError('Failed to save configuration');
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    }, [config, routeId, updateEdgeFunctionConfig, handleClose]);

    const handleTemplateSelect = (templateId: string | null) => {
        setConfig({ ...config, template_id: templateId });
    };

    return (
        <TerminalDialog
            isOpen={isOpen}
            onClose={handleClose}
            title={`EDGE FUNCTION - ${routeId}`}
            width="w-full max-w-2xl"
        >
            <div className="space-y-4">
                <TerminalToggle
                    label="Enable Edge Function"
                    checked={config.enabled}
                    onChange={(enabled: boolean) => setConfig({ ...config, enabled })}
                    disabled={isLoading}
                />

                <div>
                    <TerminalLabel description="Type of edge function behavior">
                        Function Type
                    </TerminalLabel>
                    <TerminalDropdown
                        values={FUNCTION_TYPES}
                        onSelect={(value) => setConfig({ ...config, function_type: value.id as EdgeFunctionType })}
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
                        onSelect={handleTemplateSelect}
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
                        onChange={(e) => setConfig({ ...config, max_attempts: parseInt(e.target.value) || 3 })}
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

                {error && (
                    <div className="text-red-500 text-sm font-mono">{error}</div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                    <TerminalButton variant="secondary" onClick={handleClose}>
                        Cancel
                    </TerminalButton>
                    <TerminalButton
                        variant="primary"
                        onClick={handleSave}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Saving...' : 'Save'}
                    </TerminalButton>
                </div>
            </div>
        </TerminalDialog>
    );
});

TerminalEdgeFunctionDialog.displayName = 'TerminalEdgeFunctionDialog';

export default TerminalEdgeFunctionDialog;
