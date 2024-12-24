import useStore from '../../store';
import React from "react";

export const TerminalHeader = ({
                                   leftContent,
                                   rightContent,
                                   className = ''
                               }) => {
    const theme = useStore(state => state.getCurrentTheme());

    return (
        <header className={`h-12 px-4 flex items-center justify-between border-b ${theme.border} ${className}`}>
            <div className="flex items-center gap-2">
                {leftContent}
            </div>
            <div className="flex items-center gap-4">
                {rightContent}
            </div>
        </header>
    );
};

export default TerminalHeader