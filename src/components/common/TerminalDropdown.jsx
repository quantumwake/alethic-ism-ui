import React, {useState, useEffect, useRef} from 'react';
import { Listbox } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/24/solid';
import {useStore} from '../../store';

const TerminalDropdown = ({
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
    const [selected, setSelected] = useState(null);
    const [internalValues, setInternalValues] = useState(values);

    const buttonRef = useRef(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

    // Update internal values when prop values change
    useEffect(() => {
        setInternalValues(values);
    }, [values]);

    useEffect(() => {
        const updatePosition = () => {
            if (buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                setDropdownPosition({
                    top: rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width
                });
            }
        };

        updatePosition();
        window.addEventListener('scroll', updatePosition);
        window.addEventListener('resize', updatePosition);

        return () => {
            window.removeEventListener('scroll', updatePosition);
            window.removeEventListener('resize', updatePosition);
        };
    }, []);

    // Initialize with default value or find matching item from values
    useEffect(() => {
        if (defaultValue === null && allowEmpty) {
            setSelected({ id: null, label: placeholder });
            return;
        }

        if (defaultValue !== null) {
            const defaultItem = values.find(item => item.id === defaultValue);
            if (defaultItem) {
                setSelected(defaultItem);
            } else if (values.length > 0) {
                // If defaultValue doesn't exist in values, select first item
                setSelected(values[0]);
                // Notify parent component
                onSelect?.(values[0]);
            }
        } else if (values.length > 0) {
            setSelected(values[0]);
        } else {
            // If no values available, set selected to null
            setSelected(null);
        }
    }, [defaultValue, values, allowEmpty, placeholder]);

    // External function to set value
    const setValue = (valueId) => {
        if (valueId === null && allowEmpty) {
            setSelected({ id: null, label: placeholder });
            return;
        }

        const item = values.find(item => item.id === valueId);
        if (item) {
            setSelected(item);
            onSelect?.(item);
        }
    };

    // Expose setValue function if setExternalValue is provided
    useEffect(() => {
        if (setExternalValue) {
            setExternalValue(setValue);
        }
    }, [setExternalValue, values]);

    const sizes = {
        small: 'px-2 py-0.5 text-xs',
        default: 'px-3 py-1 text-sm',
        large: 'px-4 py-2 text-base'
    };

    const handleSelect = (value) => {
        setSelected(value);
        onSelect?.(value);
    };

    const baseButtonStyle = `inline-flex items-center justify-between w-full font-mono rounded-none border ${theme.border} transition-colors duration-150 ${sizes[size]}`;
    const baseOptionStyle = 'cursor-pointer transition-colors duration-150 w-full';

    // Force Listbox to remount by using a key based on the values array
    const listboxKey = `listbox-${JSON.stringify(internalValues.map(v => v.id))}`;

    return (
        <div className={`relative ${className}`}>
            <Listbox
                key={listboxKey}
                value={selected}
                onChange={handleSelect}
                disabled={disabled}
            >
                <Listbox.Button ref={buttonRef} className={`${baseButtonStyle} ${disabled ? theme.button.disabled : theme.button.primary}`}>
                    <span className="block truncate">
                        {selected?.label || placeholder}
                    </span>
                    <ChevronUpDownIcon className="w-4 h-4 ml-2" aria-hidden="true"/>
                </Listbox.Button>

                <Listbox.Options
                    style={{
                        top: `${dropdownPosition.top}px`,
                        left: `${dropdownPosition.left}px`,
                        // width: `${dropdownPosition.width}px`
                    }}
                    className={`
                        z-50 fixed mt-1 overflow-auto border
                        max-h-60 ${theme.bg} ${theme.border} ${theme.font} ${theme.text}
                    `}>
                    {allowEmpty && (
                        <Listbox.Option
                            key="empty"
                            value={{ id: null, label: placeholder }}
                            className={({ active, selected }) => `
                                ${baseOptionStyle}
                                ${active ? theme.button.primary : theme.bg}
                                ${selected ? theme.button.primary : ''}
                                ${sizes[size]}
                            `}>
                            {({ selected }) => (
                                <span className={`block truncate ${selected ? 'font-extrabold' : ''}`}>
                                    {placeholder}
                                </span>
                            )}
                        </Listbox.Option>
                    )}

                    {internalValues && internalValues.map((item) => (
                        <Listbox.Option
                            key={item.id}
                            value={item}
                            className={({active, selected}) => `
                                ${baseOptionStyle}
                                ${active ? theme.button.primary : theme.bg}
                                ${selected ? theme.button.primary : ''}
                                ${sizes[size]}
                            `}>
                            {({selected}) => (
                                <span className={`block truncate  ${selected ? `font-extrabold` : ''}`}>
                                    {item.label}
                                </span>
                            )}
                        </Listbox.Option>
                    ))}
                </Listbox.Options>
            </Listbox>
        </div>
    );
};

export default TerminalDropdown;