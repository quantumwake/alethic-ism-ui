import React, { ReactNode } from 'react';
import { useStore } from '../../store';

interface TerminalButtonProps {
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'ghost';
    size?: 'small' | 'default' | 'large';
    disabled?: boolean;
    onClick?: () => void;
    icon?: ReactNode;
    children?: ReactNode;
    style?: React.CSSProperties | string;
    className?: string;
}

export const TerminalButton: React.FC<TerminalButtonProps> = ({
                                                                  variant = 'primary',
                                                                  size = 'default',
                                                                  disabled = false,
                                                                  onClick,
                                                                  icon,
                                                                  children,
                                                                  style = '',
                                                                  className = '',
                                                              }) => {
    const theme = useStore(state => state.getCurrentTheme());

    const variants = {
        primary: theme.button.primary,
        secondary: theme.button.secondary,
        danger: theme.button.danger,
        success: theme.button.success,
        warning: theme.button.warning,
        info: theme.button.info,
        ghost: theme.button.ghost
    };

    const sizes = {
        small: 'px-2 py-0.5 text-xs',
        default: 'px-3 py-1 text-sm',
        large: 'px-4 py-2 text-base'
    };

    const baseStyle = `inline-flex items-center justify-center font-mono rounded-none border ${theme.border} transition-colors duration-150`;
    const variantStyle = disabled ? theme.button.disabled : variants[variant];
    const sizeStyle = sizes[size];

    return (
        <button
            style={typeof style === 'string' ? undefined : style}
            onClick={!disabled ? onClick : undefined}
            disabled={disabled}
            className={`${baseStyle} ${variantStyle} ${sizeStyle} ${className}`}
        >
            {icon && <span className="mr-2">{icon}</span>}
            {children}
        </button>
    );
};

export default TerminalButton;