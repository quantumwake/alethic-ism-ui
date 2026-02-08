import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/24/solid';
import { useStore } from '../../store';

interface DropdownValue {
    id: string | null;
    label: string;
}

interface TerminalDropdownProps {
    values?: DropdownValue[];
    onSelect?: (value: DropdownValue) => void;
    defaultValue?: string | null;
    size?: 'small' | 'default' | 'large';
    disabled?: boolean;
    placeholder?: string;
    className?: string;
    allowEmpty?: boolean;
    setExternalValue?: ((setValue: (valueId: string | null) => void) => void) | null;
}

const TerminalDropdown: React.FC<TerminalDropdownProps> = ({
    values = [],
    onSelect,
    defaultValue = null,
    size = 'default',
    disabled = false,
    placeholder = 'Select an option',
    className = '',
    allowEmpty = false,
    setExternalValue = null
}) => {
    const theme = useStore(state => state.getCurrentTheme());
    const [selected, setSelected] = useState<DropdownValue | null>(null);

    const buttonRef = useRef<HTMLButtonElement>(null);

    // Memoize the position calculation to prevent unnecessary recalculations
    const calculatePosition = useCallback(() => {
        if (!buttonRef.current) return { top: 0, left: 0, width: 0 };

        const rect = buttonRef.current.getBoundingClientRect();
        return {
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width
        };
    }, []);

    // Initialize selected value only once when component mounts or values/defaultValue change significantly
    useEffect(() => {
        let newSelected: DropdownValue | null = null;

        if (defaultValue === null && allowEmpty) {
            newSelected = { id: null, label: placeholder };
        } else if (defaultValue !== null) {
            const defaultItem = values.find(item => item.id === defaultValue);
            if (defaultItem) {
                newSelected = defaultItem;
            } else if (!allowEmpty && values.length > 0) {
                // Only default to first item if allowEmpty is false
                newSelected = values[0];
            }
        } else if (!allowEmpty && values.length > 0) {
            newSelected = values[0];
        }

        if (newSelected && (!selected || selected.id !== newSelected.id)) {
            setSelected(newSelected);
            if (newSelected.id !== null) {
                onSelect?.(newSelected);
            }
        }
    }, [defaultValue, values, allowEmpty, placeholder]);

    // External function to set value
    const setValue = useCallback((valueId: string | null) => {
        if (valueId === null && allowEmpty) {
            const emptyOption = { id: null, label: placeholder };
            setSelected(emptyOption);
            return;
        }

        const item = values.find(item => item.id === valueId);
        if (item) {
            setSelected(item);
            onSelect?.(item);
        }
    }, [values, allowEmpty, placeholder, onSelect]);

    // Expose setValue function if setExternalValue is provided
    useEffect(() => {
        if (setExternalValue) {
            setExternalValue(setValue);
        }
    }, [setExternalValue, setValue]);

    const sizes: Record<string, string> = {
        small: 'px-2 py-0.5 text-xs',
        default: 'px-3 py-1 text-sm',
        large: 'px-4 py-2 text-base'
    };

    const handleSelect = (value: DropdownValue) => {
        setSelected(value);
        onSelect?.(value);
    };

    const baseButtonStyle = `inline-flex items-center justify-between w-full font-mono rounded-none border ${theme.border} transition-colors duration-150 ${sizes[size]}`;
    const baseOptionStyle = 'cursor-pointer transition-colors duration-150 w-full';

    return (
        <div className={`relative ${className}`}>
            <Listbox
                value={selected}
                onChange={handleSelect}
                disabled={disabled}
            >
                {({ open }) => (
                    <>
                        <ListboxButton
                            ref={buttonRef}
                            className={`${baseButtonStyle} ${disabled ? theme.button.disabled : theme.button.primary}`}
                        >
                            <span className="block truncate">
                                {selected?.label || placeholder}
                            </span>
                            <ChevronUpDownIcon className="w-4 h-4 ml-2" aria-hidden="true" />
                        </ListboxButton>

                        {open && (
                            <ListboxOptions
                                static
                                style={calculatePosition()}
                                className={`
                                    z-50 fixed mt-1 overflow-auto border
                                    max-h-60 ${theme.bg} ${theme.border} ${theme.font} ${theme.text}
                                `}
                            >
                                {allowEmpty && (
                                    <ListboxOption
                                        key="empty"
                                        value={{ id: null, label: placeholder }}
                                        className={({ active, selected }) => `
                                            ${baseOptionStyle}
                                            ${active ? theme.button.primary : theme.bg}
                                            ${selected ? theme.button.primary : ''}
                                            ${sizes[size]}
                                        `}
                                    >
                                        {({ selected }) => (
                                            <span className={`block truncate ${selected ? 'font-extrabold' : ''}`}>
                                                {placeholder}
                                            </span>
                                        )}
                                    </ListboxOption>
                                )}

                                {values.map((item) => (
                                    <ListboxOption
                                        key={item.id}
                                        value={item}
                                        className={({ active, selected }) => `
                                            ${baseOptionStyle}
                                            ${active ? theme.button.primary : theme.bg}
                                            ${selected ? theme.button.primary : ''}
                                            ${sizes[size]}
                                        `}
                                    >
                                        {({ selected }) => (
                                            <span className={`block truncate ${selected ? 'font-extrabold' : ''}`}>
                                                {item.label}
                                            </span>
                                        )}
                                    </ListboxOption>
                                ))}
                            </ListboxOptions>
                        )}
                    </>
                )}
            </Listbox>
        </div>
    );
};

export default TerminalDropdown;