import React, { useState, useCallback } from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlusSquare, faSearchLocation} from "@fortawesome/free-solid-svg-icons";
import {faSearch} from "@fortawesome/free-solid-svg-icons/faSearch";

const CustomerList = ({ values, renderItem, onItemClick, searchFunction, numOfColumns }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredValues = values.filter(value => searchFunction(value, searchTerm));
    const gridClasses = `grid grid-cols-${numOfColumns} gap-4`;
// alert(gridClasses)
    const handleSearch = useCallback((event) => {
        setSearchTerm(event.target.value);
    }, []);

    return (<>
            <div>
                <input
                    type="text"
                    placeholder="Search projects..."
                    className="w-full ring-2 ring-gray-300 rounded-sm text-gray-600 h-10 pl-5 pr-10 bg-white"
                    value={searchTerm}
                    onChange={handleSearch}
                />
                <FontAwesomeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" icon={faSearch}/>
            </div>
            <div className="mt-4 overflow-y-auto max-h-[calc(100vh-250px)]">
                <div className={gridClasses}>
                    {filteredValues.map((value, index) => (
                        <div key={index}
                             className="p-2 cursor-pointer bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg shadow-md"
                             onClick={() => onItemClick(value)}>
                            {renderItem(value)}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default CustomerList;