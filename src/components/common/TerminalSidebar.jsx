import {useStore} from '../../store';
import React from "react";

export const TerminalSidebar = ({
                                    isOpen,
                                    onToggle,
                                    tabContent,
                                    mainContent,
                                    className,
                                    position = 'left',
                                    width = '96',
                                    collapsedWidth = '12'
                                }) => {
    const theme = useStore(state => state.getCurrentTheme());

    return (
        <aside className={`
            ${isOpen ? `w-${width}` : `w-${collapsedWidth}`} 
            flex 
            ${position === 'left' ? 'border-r' : 'border-l'} 
            ${theme.border} 
            transition-all 
            duration-200
            ${className}
        `}>
            {position === 'left' ? (
                <>
                    {tabContent}
                    {isOpen && mainContent}
                </>
            ) : (
                <>
                    {isOpen && mainContent}
                    {tabContent}
                </>
            )}
        </aside>
    );
};

export default TerminalSidebar