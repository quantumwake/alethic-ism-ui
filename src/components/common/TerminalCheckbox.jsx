import React from 'react';
import { useStore } from '../../store';

export const TerminalCheckbox = ({
    checked = false,
    onChange,
    disabled = false,
    label,
    name,
    id,
    className = '',
}) => {
    const theme = useStore(state => state.getCurrentTheme());

    const baseStyle = 'relative inline-flex items-center cursor-pointer font-mono text-sm';
    const disabledStyle = disabled ? 'opacity-50 cursor-not-allowed' : '';
    
    const checkboxBaseStyle = `
        appearance-none w-4 h-4 border rounded-none cursor-pointer
        transition-all duration-150 focus:outline-none
    `;
    
    const checkboxStyle = disabled 
        ? `${checkboxBaseStyle} ${theme.checkbox?.disabled || theme.input.disabled}`
        : `${checkboxBaseStyle} ${theme.checkbox?.primary || theme.input.primary}`;

    return (
        <label 
            htmlFor={id} 
            className={`${baseStyle} ${disabledStyle} ${className}`}
        >
            <input
                type="checkbox"
                id={id}
                name={name}
                checked={checked}
                onChange={!disabled ? onChange : undefined}
                disabled={disabled}
                className={checkboxStyle}
                style={{
                    backgroundImage: checked ? 'url("data:image/svg+xml,%3csvg viewBox=\'0 0 16 16\' fill=\'currentColor\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3cpath d=\'M5.707 7.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1 1 0 0 0-1.414-1.414L7 8.586 5.707 7.293z\'/%3e%3c/svg%3e")' : 'none',
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            />
            {label && (
                <span className={`ml-2 ${theme.text || ''}`}>
                    {label}
                </span>
            )}
        </label>
    );
};

export default TerminalCheckbox;