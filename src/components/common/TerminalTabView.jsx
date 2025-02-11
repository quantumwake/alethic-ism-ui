import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { X } from 'lucide-react';

const TerminalTabView = ({
                             tabs = [],
                             position = 'bottom',
                             onTabClose,
                             onTabSelect,
                             className = '',
                         }) => {
    const theme = useStore((state) => state.getCurrentTheme());
    const currentWorkspace = useStore((state) => state.currentWorkspace); // Direct access to Zustand state
    const setCurrentWorkspace = useStore((state) => state.setCurrentWorkspace);
    const [activeTabIndex, setActiveTabIndex] = useState(0);

    // Update activeTabIndex when currentWorkspace changes
    useEffect(() => {
        const newIndex = tabs.findIndex((tab) => tab.name === currentWorkspace);
        if (newIndex !== -1) {
            setActiveTabIndex(newIndex);
        }
    }, [currentWorkspace, tabs]);

    const handleTabSelect = (index) => {
        const selectedTabName = tabs[index].name;
        setCurrentWorkspace(selectedTabName); // Update Zustand store directly
        onTabSelect?.(index, selectedTabName);
    };

    const handleTabClose = (e, index) => {
        e.stopPropagation();
        const closedTabName = tabs[index].name;
        onTabClose?.(index, closedTabName);

        if (currentWorkspace === closedTabName) {
            const newIndex = Math.max(0, index - 1);
            if (tabs[newIndex]) {
                setCurrentWorkspace(tabs[newIndex].name);
            }
        }
    };

    return (
        <div
            className={`flex flex-col h-full w-full ${
                position === 'bottom' ? 'flex-col' : 'flex-col-reverse'
            } ${className}`}
        >
            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {tabs[activeTabIndex]?.content}
            </div>

            {/* Tabs */}
            <div className={`flex border-t border-dashed ${theme.border}`}>
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        onClick={() => handleTabSelect(index)}
                        className={`
              group flex items-center space-x-2 px-4 py-2 text-xs font-mono
              border-r border-dashed transition-colors duration-150
              ${theme.border}
              ${
                            currentWorkspace === tab.name
                                ? theme.button.secondary
                                : theme.button.primary
                        }
            `}
                    >
                        <span>{tab.label}</span>
                        {tab.closeable && (
                            <X
                                className="w-4 h-4 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                                onClick={(e) => handleTabClose(e, index)}
                            />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TerminalTabView;