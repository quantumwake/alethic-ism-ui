import React from 'react';
import {useStore} from '../../store';

export const TerminalLabel = ({
                                  children,
                                  htmlFor,
                                  size = 'default',
                                  required = false,
                                  className = '',
                                  description,
                              }) => {
    const theme = useStore(state => state.getCurrentTheme());

    const sizes = {
        small: 'text-xs',
        default: 'text-sm',
        large: 'text-base'
    };

    return (
        <div className={`flex flex-col ${className}`}>
            <label
                htmlFor={htmlFor}
                className={`
                    ${theme.font}
                    ${theme.default.text.primary}
                    ${sizes[size]}
                    flex items-center gap-1`}>
                {children}
                {required && (
                    <span className={theme.default.text.danger}>*</span>
                )}
            </label>
            {description && (
                <span className={`
                    ${theme.font}
                    ${theme.default.text.muted}
                    ${sizes[size]}
                    -mt-1
                `}>
                    {description}
                </span>
            )}
        </div>
    );
};

export default TerminalLabel;