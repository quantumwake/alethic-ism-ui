import React from 'react';
import { Fragment } from 'react';
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";

const CustomInput = ({ name, value, placeholder, onChange }) => {
    return (
        <input
            type="text"
            name={name}
            className="w-full ring-2 ring-gray-300 rounded-sm text-gray-600 h-10 pl-5 pr-10 bg-white"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
        />
    );
};

export default CustomInput;
