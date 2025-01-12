import {useStore} from '../../store';
import React from "react";
import TerminalTabButton from "./TerminalTabButton";
import {ChevronLeft, ChevronRight} from "lucide-react";

export const TerminalTabBar = ({
                                   tabs,
                                   activeTab,
                                   onTabChange,
                                   onToggle,
                                   position = 'left',
                                   className = 'w-12'
                               }) => {
    const theme = useStore(state => state.getCurrentTheme());

    return (
        <div className={`
            flex flex-col py-2 gap-1 ${className} 
            ${position === 'left' ? 'border-r' : 'border-l'}
            ${theme.border}
        `}>
            {tabs.map(tab => (
                <TerminalTabButton
                    key={tab.id}
                    isActive={activeTab === tab.id}
                    onClick={() => onTabChange(tab.id)}
                    icon={tab.icon}
                />
            ))}
            <div className="mt-auto">
                <TerminalTabButton
                    onClick={onToggle}
                    icon={position === 'left' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                />
            </div>
        </div>
    );
};

export default TerminalTabBar