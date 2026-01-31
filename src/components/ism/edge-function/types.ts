export type EdgeFunctionType = 'CALIBRATOR' | 'VALIDATOR' | 'TRANSFORMER' | 'FILTER';

export interface EdgeFunctionConfig {
    enabled: boolean;
    function_type: EdgeFunctionType;
    template_id?: string | null;
    max_attempts?: number;
    config?: Record<string, any>;
}

export interface EdgeFunctionConfigProps {
    config: EdgeFunctionConfig;
    onChange: (config: EdgeFunctionConfig) => void;
    disabled?: boolean;
}

export const EDGE_FUNCTION_TYPES = [
    { id: 'CALIBRATOR', label: 'Calibrator' },
    { id: 'VALIDATOR', label: 'Validator' },
    { id: 'TRANSFORMER', label: 'Transformer' },
    { id: 'FILTER', label: 'Filter' }
];

export const DEFAULT_EDGE_FUNCTION_CONFIG: EdgeFunctionConfig = {
    enabled: false,
    function_type: 'CALIBRATOR',
    template_id: null,
    max_attempts: 3,
    config: {}
};
