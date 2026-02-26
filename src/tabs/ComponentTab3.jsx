import { useStore } from "../store";
import React, { useState } from 'react';
import { Search, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { processorStyles, processorCategories } from './processors';

// ============================================================================
// Component Item - Draggable palette item for StudioV3 (KGraph)
// ============================================================================

const ComponentItem = ({ icon: Icon, name, tooltip, type, color, enabled, onDragStart }) => {
    if (!enabled) return null;

    return (
        <div
            title={tooltip}
            draggable={enabled}
            onDragStart={(event) => enabled && onDragStart(event, type)}
            className={`
                flex items-center gap-3 px-3 py-2 rounded-md
                bg-midnight-surface hover:bg-midnight-elevated
                border border-transparent hover:border-midnight-border-glow
                cursor-grab active:cursor-grabbing
                transition-all duration-200 group
            `}
        >
            <div className="p-1.5 rounded bg-midnight-elevated group-hover:bg-midnight-raised">
                <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="flex-1 min-w-0">
                <span className="text-sm text-midnight-text-body group-hover:text-white truncate block">
                    {name}
                </span>
            </div>
            <Plus className="w-3 h-3 text-midnight-accent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
};

// ============================================================================
// Search Bar
// ============================================================================

const SearchBar = ({ value, onChange }) => (
    <div className="flex items-center gap-2 px-3 py-2 bg-midnight-base border-b border-midnight-border">
        <Search className="w-4 h-4 text-midnight-text-subdued" />
        <input
            type="text"
            placeholder="Search components..."
            className="flex-1 bg-transparent text-sm text-midnight-text-body placeholder-midnight-text-disabled focus:outline-none"
            value={value}
            onChange={onChange}
        />
    </div>
);

// ============================================================================
// Category Section
// ============================================================================

const CategorySection = ({ title, items, isCollapsed, onToggle, onDragStart }) => {
    const enabledItems = items.filter(item => item.enabled);

    if (enabledItems.length === 0) return null;

    return (
        <div className="border-b border-midnight-border last:border-b-0">
            <button
                onClick={onToggle}
                className={`
                    w-full flex items-center justify-between px-3 py-2
                    bg-midnight-elevated hover:bg-midnight-raised
                    text-midnight-text-label text-xs uppercase tracking-wider
                    transition-colors duration-150
                `}
            >
                <span>{title}</span>
                <div className="flex items-center gap-2">
                    <span className="text-midnight-text-disabled">{enabledItems.length}</span>
                    {isCollapsed ? (
                        <ChevronRight className="w-3 h-3" />
                    ) : (
                        <ChevronDown className="w-3 h-3" />
                    )}
                </div>
            </button>

            {!isCollapsed && (
                <div className="py-1 space-y-0.5 px-1">
                    {enabledItems.map((item) => (
                        <ComponentItem
                            key={item.type}
                            {...item}
                            onDragStart={onDragStart}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// ============================================================================
// Main ComponentTab3 — Same as ComponentTab2 but uses application/kgraph
// ============================================================================

const ComponentTab3 = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [collapsedSections, setCollapsedSections] = useState({});

    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/kgraph', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const toggleSection = (sectionKey) => {
        setCollapsedSections(prev => ({
            ...prev,
            [sectionKey]: !prev[sectionKey]
        }));
    };

    // Filter components based on search
    const getFilteredCategories = () => {
        const filtered = {};

        Object.entries(processorCategories).forEach(([categoryKey, { name, items }]) => {
            const filteredItems = items
                .map(itemKey => processorStyles[itemKey])
                .filter(item => {
                    if (!item) return false;
                    if (!searchQuery) return true;
                    return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.tooltip.toLowerCase().includes(searchQuery.toLowerCase());
                });

            if (filteredItems.length > 0) {
                filtered[categoryKey] = {
                    name,
                    items: filteredItems
                };
            }
        });

        return filtered;
    };

    const filteredCategories = getFilteredCategories();

    return (
        <div className="flex flex-col h-full bg-midnight-surface">
            {/* Header */}
            <div className="px-3 py-3 border-b border-midnight-border">
                <h2 className="text-midnight-text-primary font-medium text-sm">Components</h2>
                <p className="text-xs text-midnight-text-subdued mt-0.5">
                    Drag to canvas to create nodes
                </p>
            </div>

            {/* Search */}
            <SearchBar
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Categories */}
            <div className="flex-1 overflow-y-auto">
                {Object.entries(filteredCategories).map(([categoryKey, { name, items }]) => (
                    <CategorySection
                        key={categoryKey}
                        title={name}
                        items={items}
                        isCollapsed={collapsedSections[categoryKey]}
                        onToggle={() => toggleSection(categoryKey)}
                        onDragStart={onDragStart}
                    />
                ))}

                {Object.keys(filteredCategories).length === 0 && (
                    <div className="p-4 text-center text-midnight-text-subdued text-sm">
                        No components found
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-3 py-2 border-t border-midnight-border bg-midnight-base">
                <div className="text-xs text-midnight-text-disabled space-y-0.5">
                    <p>• Drag components to the canvas</p>
                    <p>• Connect nodes via handles</p>
                    <p>• Press Backspace to delete</p>
                </div>
            </div>
        </div>
    );
};

export default ComponentTab3;
