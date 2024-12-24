import React, { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import useStore from '../store';

const CustomList = ({
                        values = [],
                        renderItem,
                        onItemClick,
                        searchFunction,
                        numOfColumns = 1,
                        title = "ITEMS"
                    }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const theme = useStore(state => state.getCurrentTheme());

    const filteredValues = values.filter(value =>
        searchFunction(value, searchTerm)
    );

    const handleSearch = useCallback((event) => {
        setSearchTerm(event.target.value);
    }, []);

    return (
        <div className={`font-mono border ${theme.bg} ${theme.border}`}>
            {/*/!* Header *!/*/}
            {/*<div className={`flex items-center gap-1.5 px-2 py-1 border-b ${theme.border}`}>*/}
            {/*    <span className={theme.textAccent}>#</span>*/}
            {/*    <span className={`text-xs ${theme.text}`}>{title}</span>*/}
            {/*</div>*/}

            {/* Search Bar */}
            <div className={`p-1.5 border-b ${theme.border}`}>
                <div className="relative">
                    <Search className={`absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 ${theme.textAccent}`}/>
                    <input
                        type="text"
                        placeholder="search items..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className={`w-full pl-6 pr-2 py-1 text-xs ${theme.input} ${theme.text} 
                        border ${theme.border} focus:outline-none focus:ring-1 
                        placeholder:${theme.textMuted}`}
                    />
                </div>
            </div>

            {/* Content Grid */}
            <div className="p-1.5 space-y-1.5 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className={`grid grid-cols-${numOfColumns} gap-1.5`}>
                    {filteredValues.map((value, index) => (
                        <div
                            key={index}
                            onClick={() => onItemClick(value)}
                            className={`flex items-center gap-1.5 px-1.5 py-1 cursor-pointer ${theme.hover}`}>
                            <span className={theme.textAccent}>$</span>
                            {renderItem(value)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CustomList;