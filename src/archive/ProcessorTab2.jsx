import React, { useState } from 'react';
import useStore from '../store';
import { Search, Plus } from 'lucide-react';
import { processorStyles, processorCategories } from '../tabs/processors';

export const ProcessorsTab = ({ onItemClick }) => {
    const theme = useStore(state => state.getCurrentTheme());
    const [searchQuery, setSearchQuery] = useState('');
    const [collapsedSections, setCollapsedSections] = useState({});

    const getFilteredProcessors = () => {
        if (!searchQuery) return processorCategories;

        const filtered = {};
        Object.entries(processorCategories).forEach(([key, category]) => {
            const filteredItems = category.items.filter(itemKey => {
                const processor = processorStyles[itemKey];
                return processor.name.toLowerCase().includes(searchQuery.toLowerCase());
            });

            if (filteredItems.length > 0) {
                filtered[key] = {
                    ...category,
                    items: filteredItems
                };
            }
        });
        return filtered;
    };

    return (
        <div className="flex flex-col h-full">
            <div className={`p-1.5 border-b ${theme.border}`}>
                <div className="relative">
                    <Search className={`absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 ${theme.textAccent}`} />
                    <input
                        type="text"
                        placeholder="search processors..."
                        className={`w-full pl-6 pr-2 py-1 text-xs ${theme.text} ${theme.input}
                            placeholder:${theme.textMuted} focus:outline-none focus:ring-1 border`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="p-1.5 space-y-1.5 flex-1 overflow-y-auto">
                {Object.entries(getFilteredProcessors()).map(([key, category]) => {
                    const items = category.items.map(itemKey => processorStyles[itemKey]);
                    return (
                        <div key={key} className={`border ${theme.border}`}>
                            {/*<button*/}
                            {/*    onClick={() => setCollapsedSections(prev => ({*/}
                            {/*        ...prev,*/}
                            {/*        [key]: !prev[key]*/}
                            {/*    }))}*/}
                            {/*    className={`flex w-full items-center justify-between px-2 py-1*/}
                            {/*        ${theme.hover} border-b ${theme.border}`}>*/}
                            {/*    <div className="flex items-center gap-1.5">*/}
                            {/*        <span className={theme.textAccent}>#</span>*/}
                            {/*        <span className={`text-xs ${theme.text}`}>{category.name}</span>*/}
                            {/*    </div>*/}
                            {/*</button>*/}
                            {!collapsedSections[key] && (
                                <div className="py-0.5">
                                    {items.map((item) => (
                                        <div
                                            key={item.type}
                                            onClick={() => item.enabled && onItemClick?.(item)}
                                            className={`flex items-center gap-1.5 px-1.5 py-1 text-xs
                                                ${item.enabled ?
                                                `cursor-pointer ${theme.hover}` :
                                                'opacity-40 cursor-not-allowed'}`}>
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                {/*<span className={theme.textAccent}>$</span>*/}
                                                <item.icon className={`w-3 h-3 ${theme.icon}`} />
                                                <span className={`${theme.text} truncate`}>
                                                    {item.name}
                                                </span>
                                            </div>
                                            {item.enabled && (
                                                <Plus className={`w-3 h-3 ml-auto ${theme.textAccent} 
                                                    opacity-0 group-hover:opacity-100`} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProcessorsTab