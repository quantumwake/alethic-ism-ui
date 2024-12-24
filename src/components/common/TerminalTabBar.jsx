import useStore from '../../store';
import React from "react";
import TerminalTabButton from "./TerminalTabButton";
import {ChevronLeft, ChevronRight} from "lucide-react";

export const TerminalTabBar = ({
                                   tabs,
                                   activeTab,
                                   onTabChange,
                                   onToggle,
                                   position = 'left',
                                   width = '12'
                               }) => {
    const theme = useStore(state => state.getCurrentTheme());

    return (
        <div className={`
            w-${width} 
            flex 
            flex-col 
            py-2 
            gap-1 
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