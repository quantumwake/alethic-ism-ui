import React, { useEffect } from 'react';
import { TerminalLabel, TerminalDropdown } from "../../common";
import { useStore } from '../../../store';
import { EdgeFunctionConfigProps } from './types';

const CalibratorConfig: React.FC<EdgeFunctionConfigProps> = ({ config, onChange, disabled }) => {
    const theme = useStore((state: any) => state.getCurrentTheme());
    const { templates, fetchTemplates, selectedProjectId } = useStore();

    useEffect(() => {
        if (selectedProjectId) {
            fetchTemplates(selectedProjectId);
        }
    }, [selectedProjectId, fetchTemplates]);

    const templateOptions = templates?.map((t: any) => ({
        id: t.template_id,
        label: t.template_path || t.template_id
    })) || [];

    return (
        <div className="space-y-4">
            <div className="text-xs font-mono opacity-70 mb-4">
                Calibrator retries the processor with modified input until output meets calibration criteria.
            </div>

            <div>
                <TerminalLabel htmlFor="template-id" description="Template for evaluation criteria">
                    Calibration Template
                </TerminalLabel>
                <TerminalDropdown
                    values={templateOptions}
                    defaultValue={config.template_id}
                    onSelect={(item: any) => onChange({ ...config, template_id: item.id })}
                    disabled={disabled}
                    placeholder="Select template"
                    allowEmpty={true}
                />
            </div>

            <div>
                <TerminalLabel htmlFor="max-attempts" description="Maximum retry attempts before passing through">
                    Max Attempts
                </TerminalLabel>
                <input
                    id="max-attempts"
                    type="number"
                    min={1}
                    max={10}
                    value={config.max_attempts || 3}
                    onChange={(e) => onChange({ ...config, max_attempts: parseInt(e.target.value) || 3 })}
                    className={`w-full px-3 py-2 border ${theme.border} ${theme.bg} ${theme.text} font-mono text-sm focus:outline-none focus:border-amber-500`}
                    disabled={disabled}
                />
            </div>
        </div>
    );
};

export default CalibratorConfig;
