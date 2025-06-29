import React, { useState, useEffect, memo, useCallback, useRef } from 'react';
import { Editor } from "@monaco-editor/react";
import { TerminalDialog, TerminalButton, TerminalLabel } from "../common";
import { useStore } from '../../store';

interface TerminalStateFilterDialogProps {
    isOpen: boolean;
    onClose: () => void;
    filterId: string;
    direction?: string;
}

type FilterOperator = 
    | 'EQ' | 'NE' | 'GT' | 'GTE' | 'LT' | 'LTE' 
    | 'IN' | 'NOT_IN' 
    | 'CONTAINS' | 'NOT_CONTAINS' 
    | 'STARTS_WITH' | 'ENDS_WITH' 
    | 'REGEX' | 'REGEX_I' 
    | 'EXISTS' | 'NOT_EXISTS' 
    | 'IS_NULL' | 'IS_NOT_NULL' 
    | 'BETWEEN' | 'NOT_BETWEEN';

interface FilterItem {
    key: string;
    operator: FilterOperator;
    value: string | number | boolean | null | any[] | Record<string, any>;
    secondary_value?: string | number | boolean | null;
}

interface Filter {
    id: string;
    name?: string;
    type?: 'include' | 'exclude';
    filter_items: Record<string, FilterItem>;
}

interface FilterConfig {
    filter_items: Record<string, FilterItem>;
}

const DEFAULT_FILTER_CONFIG: FilterConfig = {
    filter_items: {
        first_name: {
            key: "first_name",
            operator: "EQ",
            value: "bob"
        },
        age: {
            key: "age",
            operator: "BETWEEN",
            value: 18,
            secondary_value: 65
        },
        email: {
            key: "email",
            operator: "ENDS_WITH",
            value: "@example.com"
        },
        tags: {
            key: "tags",
            operator: "IN",
            value: ["premium", "active"]
        }
    }
};

// JSON Schema for filter validation
const FILTER_SCHEMA = {
    type: 'object',
    properties: {
        filter_items: {
            type: 'object',
            additionalProperties: {
                type: 'object',
                properties: {
                    key: { 
                        type: 'string',
                        description: 'The field name to filter on'
                    },
                    operator: { 
                        type: 'string', 
                        enum: [
                            'EQ', 'NE', 'GT', 'GTE', 'LT', 'LTE',
                            'IN', 'NOT_IN',
                            'CONTAINS', 'NOT_CONTAINS',
                            'STARTS_WITH', 'ENDS_WITH',
                            'REGEX', 'REGEX_I',
                            'EXISTS', 'NOT_EXISTS',
                            'IS_NULL', 'IS_NOT_NULL',
                            'BETWEEN', 'NOT_BETWEEN'
                        ],
                        description: 'The comparison operator'
                    },
                    value: { 
                        oneOf: [
                            { type: 'string' },
                            { type: 'number' },
                            { type: 'boolean' },
                            { type: 'null' },
                            { type: 'array' },
                            { type: 'object' }
                        ],
                        description: 'The value to compare against'
                    },
                    secondary_value: {
                        oneOf: [
                            { type: 'string' },
                            { type: 'number' },
                            { type: 'boolean' },
                            { type: 'null' }
                        ],
                        description: 'Secondary value for BETWEEN operations'
                    }
                },
                required: ['key', 'operator', 'value']
            }
        }
    },
    required: ['filter_items']
};

const TerminalStateFilterDialog = memo<TerminalStateFilterDialogProps>(({ isOpen, onClose, filterId, direction = "input" }) => {
    const theme = useStore(state => state.getCurrentTheme());
    const { createOrUpdateFilter, fetchFilter } = useStore();
    const editorRef = useRef<any>(null);
    
    const [filterType, setFilterType] = useState<'include' | 'exclude'>('include');
    const [filterConfig, setFilterConfig] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [existingFilter, setExistingFilter] = useState<Filter | null>(null);

    const initializeWithDefaultConfig = useCallback(() => {
        setFilterConfig(JSON.stringify(DEFAULT_FILTER_CONFIG, null, 2));
        setExistingFilter(null);
        setFilterType('include');
    }, []);

    const loadExistingFilter = useCallback(async () => {
        if (!filterId) return;
        
        setIsLoading(true);
        setError('');
        
        try {
            const filter = await fetchFilter(filterId) as Filter | null;
            
            if (filter) {
                setExistingFilter(filter);
                setFilterConfig(JSON.stringify({
                    filter_items: filter.filter_items || {}
                }, null, 2));
                setFilterType(filter.type || 'include');
            } else {
                initializeWithDefaultConfig();
            }
        } catch (err) {
            console.error('Error fetching filter:', err);
            setError('Failed to load existing filter');
            initializeWithDefaultConfig();
        } finally {
            setIsLoading(false);
        }
    }, [filterId, fetchFilter, initializeWithDefaultConfig]);

    useEffect(() => {
        if (!isOpen) return;
        
        void loadExistingFilter();
    }, [isOpen, loadExistingFilter]);

    const handleClose = useCallback(() => {
        setError('');
        setExistingFilter(null);
        setFilterType('include');
        onClose();
    }, [onClose]);

    const validateFilterConfig = (config: string): FilterConfig => {
        const parsed = JSON.parse(config);
        
        if (!parsed.filter_items || typeof parsed.filter_items !== 'object') {
            throw new Error('filter_items must be an object');
        }
        
        return parsed as FilterConfig;
    };

    const handleApplyFilter = useCallback(async () => {
        setError('');
        setIsLoading(true);
        
        try {
            const parsedConfig = validateFilterConfig(filterConfig);
            
            const filter: Filter = {
                id: filterId,
                name: `Edge Filter - ${filterId}`,
                type: filterType,
                filter_items: parsedConfig.filter_items,
            };
            
            const savedFilter = await createOrUpdateFilter(filter);
            
            if (savedFilter) {
                console.log('Filter applied successfully:', savedFilter);
                handleClose();
            } else {
                setError('Failed to save filter');
            }
        } catch (e) {
            if (e instanceof SyntaxError) {
                setError('Invalid JSON syntax');
            } else if (e instanceof Error) {
                setError(e.message);
            } else {
                setError('An unknown error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    }, [filterConfig, filterId, filterType, createOrUpdateFilter, handleClose]);

    const handleTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterType(e.target.value as 'include' | 'exclude');
    }, []);

    const handleEditorChange = useCallback((value: string | undefined) => {
        setFilterConfig(value || '');
        setError('');
    }, []);

    const handleEditorMount = useCallback((editor: any, monaco: any) => {
        editorRef.current = editor;
        editor.focus();
        
        // Configure JSON language features
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
            validate: true,
            schemas: [{
                uri: 'http://myserver/filter-schema.json',
                fileMatch: ['*'],
                schema: FILTER_SCHEMA
            }]
        });
    }, []);

    return (
        <TerminalDialog 
            isOpen={isOpen} 
            onClose={handleClose} 
            title={`STATE DATA FILTER - ${direction.toUpperCase()} - EDGE: ${filterId}`}
        >
            <div className="space-y-4">
                <div>
                    <TerminalLabel htmlFor="filter-type" description="">Filter Type</TerminalLabel>
                    <select
                        id="filter-type"
                        className={`w-full px-3 py-2 border ${theme.border} ${theme.bg} ${theme.text} font-mono text-sm focus:outline-none focus:border-amber-500`}
                        value={filterType}
                        onChange={handleTypeChange}
                        disabled={isLoading}
                    >
                        <option value="include">Include</option>
                        <option value="exclude">Exclude</option>
                    </select>
                </div>

                <div>
                    <TerminalLabel htmlFor="filter-config" description="">Filter Configuration (JSON)</TerminalLabel>
                    <div className="relative flex h-[300px] w-full p-1 bg-emerald-950">
                        <Editor
                            theme="vs-dark"
                            defaultLanguage="json"
                            value={filterConfig}
                            onChange={handleEditorChange}
                            onMount={handleEditorMount}
                            options={{
                                lineNumbers: 'on',
                                minimap: {
                                    enabled: false
                                },
                                scrollBeyondLastLine: true,
                                fontSize: 14,
                                fontLigatures: true,
                                renderLineHighlight: 'all',
                                cursorStyle: 'line',
                                automaticLayout: true,
                                padding: {
                                    top: 10,
                                    bottom: 10
                                },
                                scrollbar: {
                                    vertical: 'visible',
                                    horizontal: 'visible',
                                    verticalScrollbarSize: 12,
                                    horizontalScrollbarSize: 12
                                },
                                suggest: {
                                    showMethods: true,
                                    showFunctions: true,
                                    showConstructors: true,
                                    showDeprecated: false,
                                    matchOnWordStartOnly: false
                                },
                                wordWrap: 'off',
                                formatOnPaste: true,
                                formatOnType: true
                            }}
                        />
                    </div>
                    {error && (
                        <div className="mt-2 text-red-500 text-sm font-mono">{error}</div>
                    )}
                </div>

                <div className="text-xs font-mono opacity-70 max-h-32 overflow-y-auto">
                    <div className="font-bold mb-1">Supported operators:</div>
                    <div className="grid grid-cols-2 gap-x-4">
                        <div>• EQ - Equal to</div>
                        <div>• NE - Not equal to</div>
                        <div>• GT - Greater than</div>
                        <div>• GTE - Greater than or equal</div>
                        <div>• LT - Less than</div>
                        <div>• LTE - Less than or equal</div>
                        <div>• IN - Value in array</div>
                        <div>• NOT_IN - Value not in array</div>
                        <div>• CONTAINS - Contains substring</div>
                        <div>• NOT_CONTAINS - Not contains</div>
                        <div>• STARTS_WITH - Starts with</div>
                        <div>• ENDS_WITH - Ends with</div>
                        <div>• REGEX - Regex match</div>
                        <div>• REGEX_I - Regex (case insensitive)</div>
                        <div>• EXISTS - Field exists</div>
                        <div>• NOT_EXISTS - Field not exists</div>
                        <div>• IS_NULL - Is null</div>
                        <div>• IS_NOT_NULL - Is not null</div>
                        <div>• BETWEEN - Between values*</div>
                        <div>• NOT_BETWEEN - Not between*</div>
                    </div>
                    <div className="mt-1 text-amber-500">* Requires secondary_value field</div>
                </div>

                <div className="flex justify-end gap-2">
                    <TerminalButton variant="primary" onClick={handleClose}>
                        Discard
                    </TerminalButton>
                    <TerminalButton 
                        variant="primary" 
                        onClick={handleApplyFilter}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Loading...' : existingFilter ? 'Update Filter' : 'Apply Filter'}
                    </TerminalButton>
                </div>
            </div>
        </TerminalDialog>
    );
});

TerminalStateFilterDialog.displayName = 'TerminalStateFilterDialog';

export default TerminalStateFilterDialog;