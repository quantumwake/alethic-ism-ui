import React from "react";
import {useStore} from '../../store';

export const TerminalFooter = ({
                                   leftContent,
                                   rightContent,
                                   className = ''
                               }) => {
    const theme = useStore(state => state.getCurrentTheme());

    return (
        <footer className={`
            h-9 px-6 flex items-center justify-between
            bg-midnight-surface/90 backdrop-blur-sm
            border-t border-midnight-border
            text-xs font-mono
            relative z-50
            ${className}
        `}>
            <span className="text-midnight-text-subdued">{leftContent}</span>
            <span className="text-midnight-text-subdued">{rightContent}</span>
        </footer>
    );
};

export default TerminalFooter