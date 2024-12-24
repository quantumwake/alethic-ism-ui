import React, {useState} from "react";
import useStore from '../../store';
import {
    ChevronDown,
    ChevronRight,
} from 'lucide-react';

const TerminalTabViewSection = ({title, items, sub = false}) => {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const theme = useStore(state => state.getCurrentTheme())


    // Define different styles for main sections and subsections
    const sectionStyles = sub ? {
        // Subsection styles - no background, slightly indented
        wrapper: "",
        header: `flex w-full items-center justify-between px-2 py-1 ${theme.tab.section.hover} font-mono border-b ${theme.border}`,
        headerText: `${theme.text}`
    } : {
        // Main section styles - with background color
        wrapper: "",
        header: `flex w-full items-center justify-between px-2 py-1 ${theme.tab.section.hover} ${theme.tab.section.header} font-mono border-b ${theme.border} ${theme.bgAccent}`,
        headerText: `${theme.text} font-semibold`
    };

    return (<>
        <div className={`border-0 ${theme.border} ${sectionStyles.wrapper} flex flex-col`}>
            {/* collapse button */}
            <button onClick={() => setIsCollapsed(prevState => !prevState)} className={sectionStyles.header}>
                <div className="flex items-center gap-1.5">
                    <span className={theme.textAccent}>{sub ? '-' : '#'}</span>
                    <span className={`text-xs ${sectionStyles.headerText}`}>{title}</span>
                </div>
                {isCollapsed ? (
                    <ChevronRight className={`w-3 h-3 ${theme.textAccent}`}/>
                ) : (
                    <ChevronDown className={`w-3 h-3 ${theme.textAccent}`}/>
                )}
            </button>

            {/* section items */}
            {!isCollapsed && (
                <div className={`py-0.5 overflow-y-auto h-full`}>
                    {Object.entries(items).map(([key, sub]) => (
                        <div key={key}>{sub.content}</div>
                    ))}
                </div>
            )}
        </div>
    </>);
}

export default TerminalTabViewSection