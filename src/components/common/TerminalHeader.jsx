import {useStore} from '../../store';
import React from "react";

export const TerminalHeader = ({
                                   leftContent,
                                   rightContent,
                                   className = ''
                               }) => {
    const theme = useStore(state => state.getCurrentTheme());

    return (
        <header className={`
            h-14 px-6 flex items-center justify-between
            bg-midnight-elevated/80 backdrop-blur-sm
            border-b border-midnight-border
            shadow-[0_2px_8px_rgba(0,0,0,0.3)]
            ${className}
        `}>
            <div className="flex items-center gap-3 text-midnight-text-primary font-semibold tracking-wide">
                {leftContent}
            </div>
            <div className="flex items-center gap-4">
                {rightContent}
            </div>
        </header>
    );
};

export default TerminalHeader