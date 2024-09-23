import React from 'react';
import { Fragment } from 'react';
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";

const CustomListbox = ({ option_value_key, option_label_key, options, value, placeholder, onChange }) => {

    const option_object = options.find(option => option[option_value_key] === value);

    return (
        <Listbox onChange={onChange}>
            {/*<div className="min-w-[300pt] min-h-10 relative ring-2 ring-black ring-opacity-5 rounded-lg">*/}
            <div className="min-h-10 relative ring-2 ring-gray-300 rounded-sm">

                <Listbox.Button
                    className="w-full rounded-sm bg-white p-2.5 text-left sm:text-sm">
                    <span
                        className="block truncate">{option_object ? option_object[option_label_key] : (placeholder || "")}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon className="h-5 w-5 text-gray-600" aria-hidden="true"/>
                    </span>
                </Listbox.Button>

                <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0">
                    <Listbox.Options
                        className="absolute z-10 mt-1 max-h-60 min-w-[300pt] overflow-auto rounded-md bg-white py-1 text-base ring-2 ring-black ring-opacity-5 focus:outline-none sm:text-sm">

                        {options.map((option, optionIndex) => (
                            <Listbox.Option
                                key={option[option_value_key]}
                                value={option[option_value_key]}
                                className={({active}) =>
                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                        active ? 'bg-amber-200 text-amber-900' : 'text-gray-900'
                                    }`
                                }>
                                {({selected}) => (
                                    <>
                                        <span className={`block truncate ${
                                            selected ? 'font-medium' : 'font-normal'
                                        }`}>{option[option_label_key]}
                                        </span>
                                        {selected ? (
                                            <span
                                                className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                                <CheckIcon className="h-5 w-5" aria-hidden="true"/>
                                            </span>
                                        ) : null}
                                    </>
                                )}
                            </Listbox.Option>
                        ))}
                    </Listbox.Options>
                </Transition>
            </div>
        </Listbox>
    );
};

export default CustomListbox;
