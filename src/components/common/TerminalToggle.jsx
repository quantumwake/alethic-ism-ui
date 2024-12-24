import React, {useEffect} from 'react';
import useStore from '../../store';

export const TerminalToggle = ({
                                   checked = false,
                                   onChange,
                                   disabled = false,
                                   size = 'default',
                                   variant = 'primary',
                                   label = '',
                                   className = '',
                               }) => {

    const theme = useStore(state => state.getCurrentTheme());

    const variants = {
        primary: {
            active: theme.toggle.primary.active,
            inactive: theme.toggle.primary.inactive
        },
        secondary: {
            active: theme.toggle.secondary.active,
            inactive: theme.toggle.secondary.inactive
        },
        danger: {
            active: theme.toggle.danger.active,
            inactive: theme.toggle.danger.inactive
        },
        success: {
            active: theme.toggle.success.active,
            inactive: theme.toggle.success.inactive
        }
    };

    const sizes = {
        small: {
            switch: 'w-8 h-4',
            toggle: 'w-3 h-3',
            translate: 'translate-x-4'
        },
        default: {
            switch: 'w-10 h-5',
            toggle: 'w-4 h-4',
            translate: 'translate-x-5'
        },
        large: {
            switch: 'w-12 h-6',
            toggle: 'w-5 h-5',
            translate: 'translate-x-6'
        }
    };

    const currentSize = sizes[size];
    const currentVariant = variants[variant];
    const variantStyle = disabled ? theme.disabled : currentVariant;


    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled) {
                onChange(!checked);
            }
        }
    };

    return (
        <div className={`flex w-full items-center ${className}`}>
            <div className={`grow ${theme.font} ${theme.text} ${currentSize.text}`}>
                {label}
            </div>
            <button
                role="switch"
                aria-checked={checked}
                tabIndex={0}
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                onKeyDown={handleKeyDown}
                className={`
                relative inline-flex border-2
                cursor-pointer rounded-none transition-colors ease-in-out
                duration-200 focus:outline-none
                ${currentSize.switch}
                ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                ${checked ? variantStyle.active : variantStyle.inactive}
                ${theme.font}
            `}
            >
            <span
                className={` 
                    pointer-events-none inline-block transform
                    transition ease-in-out duration-200
                    ${currentSize.toggle}
                    ${checked ? currentSize.translate : 'translate-x-0'}
                    ${theme.toggle}
                `}
            />
            </button>
        </div>
    );
};

export default TerminalToggle;