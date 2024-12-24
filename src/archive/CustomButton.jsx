import React from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const CustomButton = ( { value, onClick, icon }) => {
    return (
        <button
            type="button"
            className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            onClick={onClick}>
            <span>
                <FontAwesomeIcon icon={'fa-brands' + icon} /> {value}
            </span>
        </button>
    )
    ;
};

export default CustomButton;
