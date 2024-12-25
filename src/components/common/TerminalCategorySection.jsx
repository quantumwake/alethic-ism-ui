import React, {useState} from "react";
import {ChevronDown, ChevronRight} from "lucide-react";
import {useStore} from '../../store';

export const TerminalCategorySection = ({ title, children, defaultCollapsed = false }) => {
    const theme = useStore(state => state.getCurrentTheme());
    const [isCollapsed, setCollapsed] = useState(defaultCollapsed);

    return (
        <div className={`border ${theme.border}`}>
            <button
                onClick={() => setCollapsed(!isCollapsed)}
                className={`flex w-full items-center justify-between px-2 py-1
                    ${theme.hover} transition-colors border-b ${theme.border}`}>
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
                    {children}
                </div>
            )}
        </div>
    );
};

export default TerminalCategorySection