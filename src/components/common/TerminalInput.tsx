import React, { ChangeEvent, KeyboardEvent, FocusEvent, ReactNode } from 'react';
import { useStore } from '../../store';

interface TerminalInputProps {
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'ghost';
    size?: 'small' | 'default' | 'large';
    disabled?: boolean;
    type?: string;
    name?: string;
    value?: string;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
    onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
    onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
    placeholder?: string;
    icon?: ReactNode;
    className?: string;
}

export const TerminalInput: React.FC<TerminalInputProps> = ({
    variant = 'primary',
    size = 'default',
    disabled = false,
    type = 'text',
    name,
    value,
    onChange,
    onKeyDown,
    onFocus,
    onBlur,
    placeholder = '',
    icon,
    className = '',
}) => {
    const theme = useStore(state => state.getCurrentTheme());

    const variants = {
        primary: theme.input.primary,
        secondary: theme.input.secondary,
        danger: theme.input.danger,
        success: theme.input.success,
        warning: theme.input.warning,
        info: theme.input.info,
        ghost: theme.input.ghost
    };

    const sizes = {
        small: 'px-2 py-0.5 text-xs',
        default: 'px-3 py-1 text-sm',
        large: 'px-4 py-2 text-base'
    };

    const baseStyle = 'w-full font-mono rounded-none border transition-colors duration-150 focus:outline-none';
    const variantStyle = disabled ? theme.input.disabled : variants[variant];
    const sizeStyle = sizes[size];

    return (
        <div className="relative flex items-center border-1">
            {icon && (
                <span className={`absolute left-2 ${theme.icon}`}>
                    {icon}
                </span>
            )}
            <input
                type={type}
                autoComplete={type === 'password' ? "on" : "off"}
                name={name}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
                onFocus={onFocus}
                onBlur={onBlur}
                disabled={disabled}
                placeholder={placeholder}
                className={`
                    ${baseStyle}
                    ${variantStyle}
                    ${sizeStyle}
                    ${icon ? 'pl-8' : ''}
                    ${className}
                    ${theme.font}
                `}
            />
        </div>
    );
};

export default TerminalInput;