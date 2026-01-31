import React, { useEffect, useRef } from 'react';
import { Editor } from "@monaco-editor/react";
import { TerminalLabel, TerminalDropdown } from "../../common";
import { useStore } from '../../../store';
import { EdgeFunctionConfigProps } from './types';

const TransformerConfig: React.FC<EdgeFunctionConfigProps> = ({ config, onChange, disabled }) => {
    const theme = useStore((state: any) => state.getCurrentTheme());
    const { templates, fetchTemplates, selectedProjectId } = useStore();
    const editorRef = useRef<any>(null);

    useEffect(() => {
        if (selectedProjectId) {
            fetchTemplates(selectedProjectId);
        }
    }, [selectedProjectId, fetchTemplates]);

    const templateOptions = templates?.map((t: any) => ({
        id: t.template_id,
        label: t.template_path || t.template_id
    })) || [];

    const transformationCode = config.config?.transformation || '';

    return (
        <div className="space-y-4">
            <div className="text-xs font-mono opacity-70 mb-4">
                Transformer modifies output data before it reaches the state storage.
            </div>

            <div>
                <TerminalLabel htmlFor="template-id" description="Template for transformation logic">
                    Transformation Template
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
                <TerminalLabel htmlFor="transformation" description="Python transformation code (has access to 'data' dict)">
                    Transformation Code
                </TerminalLabel>
                <div className="relative flex h-[150px] w-full p-1 bg-emerald-950">
                    <Editor
                        theme="vs-dark"
                        defaultLanguage="python"
                        value={transformationCode}
                        onChange={(value) => onChange({
                            ...config,
                            config: { ...config.config, transformation: value || '' }
                        })}
                        onMount={(editor) => { editorRef.current = editor; }}
                        options={{
                            lineNumbers: 'on',
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            fontSize: 13,
                            automaticLayout: true,
                            padding: { top: 8, bottom: 8 },
                            readOnly: disabled
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default TransformerConfig;
