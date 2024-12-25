import React, { useState } from 'react';
import {useStore} from '../../store';
import { X } from 'lucide-react';

const TerminalTabView = ({
                        tabs = [],
                        position = 'bottom',
                        onTabClose,
                        onTabSelect,
                        defaultTab = 0,
                        className = ''
                    }) => {

    const theme = useStore(state => state.getCurrentTheme());
    const [activeTab, setActiveTab] = useState(defaultTab);

    const handleTabSelect = (index) => {
        setActiveTab(index);
        onTabSelect?.(index);
    };

    const handleTabClose = (e, index) => {
        e.stopPropagation();
        onTabClose?.(index);
        if (activeTab === index) {
            setActiveTab(Math.max(0, index - 1));
        }
    };

    return (
        <div className={`flex flex-col h-full w-full ${position === 'bottom' ? 'flex-col' : 'flex-col-reverse'} ${className}`}>
            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {tabs[activeTab]?.content}
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
              ${activeTab === index ? theme.button.secondary : theme.button.primary}
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