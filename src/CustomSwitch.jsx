import {Switch} from "@headlessui/react";


import React from 'react';

const CustomSwitch = ({ checked, onChange }) => {
    return (
        <Switch
            checked={checked}
            onChange={onChange}
            className={`${
                checked ? 'bg-emerald-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full`}
        >
            <span
                className={`${
                    checked ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition`}
            />
        </Switch>
    );
};

export default CustomSwitch;