import React, { useState } from 'react';

import {
    GripHorizontal,
    X,
    ChevronDown,
    ChevronRight,
    Search,
    Plus
} from 'lucide-react';
import useStore from "../store";

const LibraryItem = ({ icon: Icon, name, tooltip, type, enabled, onDragStart, theme }) => (
    <div
        draggable={enabled}
        title={tooltip}
        className={`flex items-center gap-1.5 px-1.5 py-1 font-mono text-xs
        ${enabled ? `cursor-grab active:cursor-grabbing ${theme.hover}` : 'opacity-40 cursor-not-allowed'}`}
        onDragStart={(event) => enabled && onDragStart(event, type)}>
        <div className="flex items-center gap-1.5 min-w-0">
            <span className={theme.textAccent}>$</span>
            <Icon className={`w-3 h-3 ${theme.icon}`} />
            <span className={`${theme.text} truncate`}>{name}</span>
        </div>
        {enabled && (
            <Plus className={`w-3 h-3 ml-auto ${theme.textAccent} opacity-0 group-hover:opacity-100`} />
        )}
    </div>
);

const SearchBar = ({ value, onChange, theme }) => (
    <div className="relative font-mono">
        <Search className={`absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 ${theme.textAccent}`} />
        <input
            type="text"
            placeholder="search components..."
            className={`w-full pl-6 pr-2 py-1 text-xs ${theme.text} ${theme.input} placeholder:${theme.textMuted} focus:outline-none focus:ring-1 border`}
            value={value}
            onChange={onChange}
        />
    </div>
);

const CategorySection = ({ title, items, isCollapsed, onToggle, onDragStart, theme }) => (
    <div className={`border ${theme.border}`}>
        <button
            onClick={onToggle}
            className={`flex w-full items-center justify-between px-2 py-1
            ${theme.hover} transition-colors font-mono border-b ${theme.border}`}>
            <div className="flex items-center gap-1.5">
                <span className={theme.textAccent}>#</span>
                <span className={`text-xs ${theme.text}`}>{title}</span>
            </div>
            {isCollapsed ? (
                <ChevronRight className={`w-3 h-3 ${theme.textAccent}`} />
            ) : (
                <ChevronDown className={`w-3 h-3 ${theme.textAccent}`} />
            )}
        </button>
        {!isCollapsed && (
            <div className="py-0.5">
                {items.map((item) => (
                    <LibraryItem
                        key={item.type}
                        {...item}
                        onDragStart={onDragStart}
                        theme={theme}
                    />
                ))}
            </div>
        )}
    </div>
);

const FloatingLibrary = ({ processorStyles, processorCategories }) => {
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [searchQuery, setSearchQuery] = useState('');
    const [isMinimized, setIsMinimized] = useState(false);
    const [collapsedSections, setCollapsedSections] = useState(
        Object.keys(processorCategories).reduce((acc, key) => ({
            ...acc,
            [key]: false
        }), {})
    );

    // const theme = themes[activeTheme];
    const theme = useStore(state => state.getCurrentTheme());

    const handleMouseDown = (e) => {
        if (e.target.closest('.handle')) {
            setIsDragging(true);
            const rect = e.currentTarget.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const toggleSection = (section) => {
        setCollapsedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const getFilteredProcessors = () => {
        if (!searchQuery) return processorCategories;

        const filteredCategories = {};
        Object.entries(processorCategories).forEach(([category, { name, items }]) => {
            const filteredItems = items.filter(itemKey => {
                const processor = processorStyles[itemKey];
                return processor.name.toLowerCase().includes(searchQuery.toLowerCase());
            });

            if (filteredItems.length > 0) {
                filteredCategories[category] = {
                    name,
                    items: filteredItems
                };
            }
        });

        return filteredCategories;
    };

    return (
        <div className={`fixed shadow-lg font-mono border ${theme.bg} ${theme.border}`}
            style={{
                left: position.x,
                top: position.y,
                width: '260px',
                cursor: isDragging ? 'grabbing' : 'auto',
                zIndex: 50
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}>

            <div className={`flex items-center justify-between px-2 py-1 handle cursor-grab border-b ${theme.border}`}>
                <div className="flex items-center gap-1.5">
                    <GripHorizontal className={`w-3 h-3 ${theme.textAccent}`} />
                    <span className={`text-xs ${theme.text}`}>COMPONENTS</span>
                </div>
                <div className="flex items-center">
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className={`p-0.5 ${theme.hover} ${theme.textAccent}`}>
                        {isMinimized ? (
                            <ChevronRight className="w-3 h-3" />
                        ) : (
                            <ChevronDown className="w-3 h-3" />
                        )}
                    </button>
                    <button
                        onClick={() => setIsMinimized(true)}
                        className={`p-0.5 ${theme.hover} ${theme.textAccent}`}>
                        <X className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {!isMinimized && (<>
                <div className={`p-1.5 border-b ${theme.border}`}>
                    <SearchBar
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        theme={theme}
                    />
                </div>

                <div className="p-1.5 space-y-1.5 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {Object.entries(getFilteredProcessors()).map(([key, category]) => (
                        <CategorySection
                            key={key}
                            title={category.name}
                            items={category.items.map(itemKey => processorStyles[itemKey])}
                            isCollapsed={collapsedSections[key]}
                            onToggle={() => toggleSection(key)}
                            onDragStart={onDragStart}
                            theme={theme}
                        />
                    ))}
                </div>
            </>)}
        </div>
    );
};

export default FloatingLibrary;