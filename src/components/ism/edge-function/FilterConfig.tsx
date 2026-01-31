import React, { useRef } from 'react';
import { Editor } from "@monaco-editor/react";
import { TerminalLabel, TerminalDropdown } from "../../common";
import { useStore } from '../../../store';
import { EdgeFunctionConfigProps } from './types';

const FilterConfig: React.FC<EdgeFunctionConfigProps> = ({ config, onChange, disabled }) => {
    const editorRef = useRef<any>(null);

    const filterModes = [
        { id: 'INCLUDE', label: 'Include - Only pass matching messages' },
        { id: 'EXCLUDE', label: 'Exclude - Drop matching messages' }
    ];

    const filterConditions = config.config?.conditions || '{}';

    return (
        <div className="space-y-4">
            <div className="text-xs font-mono opacity-70 mb-4">
                Filter passes or drops messages based on conditions applied to the output data.
            </div>

            <div>
                <TerminalLabel htmlFor="filter-mode" description="Whether to include or exclude matching messages">
                    Filter Mode
                </TerminalLabel>
                <TerminalDropdown
                    values={filterModes}
                    defaultValue={config.config?.mode || 'INCLUDE'}
                    onSelect={(item: any) => onChange({
                        ...config,
                        config: { ...config.config, mode: item.id }
                    })}
                    disabled={disabled}
                    placeholder="Select mode"
                />
            </div>

            <div>
                <TerminalLabel htmlFor="conditions" description="Filter conditions as JSON (same format as state filters)">
                    Filter Conditions
                </TerminalLabel>
                <div className="relative flex h-[180px] w-full p-1 bg-emerald-950">
                    <Editor
                        theme="vs-dark"
                        defaultLanguage="json"
                        value={filterConditions}
                        onChange={(value) => onChange({
                            ...config,
                            config: { ...config.config, conditions: value || '{}' }
                        })}
                        onMount={(editor) => { editorRef.current = editor; }}
                        options={{
                            lineNumbers: 'on',
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            fontSize: 13,
                            automaticLayout: true,
                            padding: { top: 8, bottom: 8 },
                            readOnly: disabled,
                            formatOnPaste: true
                        }}
                    />
                </div>
                <div className="text-xs font-mono opacity-50 mt-1">
                    Example: {`{"field": {"operator": "EQ", "value": "expected"}}`}
                </div>
            </div>
        </div>
    );
};

export default FilterConfig;
