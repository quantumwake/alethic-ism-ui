import {useStore} from "../store";
import React, {useState} from 'react';
import {Search,Plus} from 'lucide-react';
import {processorStyles, processorCategories} from './processors';
import {TerminalTabViewSection} from "../components/common";

const LibraryGroupItem = ({icon: Icon, name, tooltip, type, enabled, onDragStart}) => {
    const theme = useStore(state => state.getCurrentTheme());

    return (
        <div title={tooltip} draggable={enabled} onDragStart={(event) => enabled && onDragStart(event, type)}
             className={`flex items-center gap-1.5 px-1.5 py-1 font-mono text-xs ${enabled ? `cursor-grab active:cursor-grabbing ${theme.hover}` : 'opacity-40 cursor-not-allowed'}`}>

            <div className="flex items-center gap-1.5 min-w-0">
                <span className={theme.textAccent}>$</span>
                {/*<Icon className={`w-3 h-3 ${theme.icon}`}/>*/}
                <span className={`${theme.text} truncate`}>{name}</span>
            </div>

            {enabled && (<Plus className={`w-3 h-3 ml-auto ${theme.textAccent} opacity-0 group-hover:opacity-100`}/>)}
        </div>
    )
}

const SearchBar = ({value, onChange, theme}) => (
    // <div className="relative font-mono">
    <div className={`flex items-center p-2 border-0 ${theme.border}`}>
        {/*<Search className={`absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 ${theme.textAccent}`}/>*/}
        <Search className={`w-3 h-3 ${theme.icon}`}/>
        <input
            type="text"
            placeholder="search components..."
            // className={`w-full pl-6 pr-2 py-1 text-xs ${theme.text} ${theme.input} placeholder:${theme.textMuted} focus:outline-none focus:ring-1 border`}
            className={`w-full bg-transparent text-xs ${theme.text} focus:outline-none px-2`}
            value={value}
            onChange={onChange}
        />
    </div>
);

const ComponentTab = ({}) => {
    const [position, setPosition] = useState({x: 20, y: 20});
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({x: 0, y: 0});
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

    const filteredLibraryComponents = () => {
        if (!searchQuery) {
            return processorCategories;
        }

        const filteredCategories = {}
        Object.entries(processorCategories).forEach(([category, {name, items}]) => {
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


    const LibraryGroup = ({items, onDragStart}) => (
        <div className="py-0.5">
            {items.map((item) => (
                <LibraryGroupItem
                    key={item.type}
                    {...item}
                    onDragStart={onDragStart}
                    theme={theme}
                />
            ))}
        </div>
    );

    const renderLibraryGroup = (groupId, group) => {
        const sections = filteredLibraryComponents()
        const section = sections[groupId]
        const sectionName = section.name
        const sectionItems = section.items

        return {
            components: {
                content: <LibraryGroup  title={sectionName} items={sectionItems.map(itemKey => processorStyles[itemKey])} onDragStart={onDragStart} />
            },
        }
    }

return (
    <div className="p-1.5 space-y-1.5 max-h-[calc(100vh-200px)] overflow-y-auto">
        {Object.entries(filteredLibraryComponents()).map(([groupId, group]) => (
            <TerminalTabViewSection title={group.name} items={renderLibraryGroup(groupId, group)} />
        ))}

        </div>
    );
};

export default ComponentTab;