import React from 'react';
import useStore from '../../store';

export const TerminalInput = ({
                                  variant = 'primary',
                                  size = 'default',
                                  disabled = false,
                                  type = 'text',
                                  name,
                                  value,
                                  onChange,
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
        <div className="relative flex items-center">
            {icon && (
                <span className={`absolute left-2 ${theme.icon}`}>
                    {icon}
                </span>
            )}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
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