import React from "react";
import {useStore} from '../../store';

export const TerminalFooter = ({
                                   leftContent,
                                   rightContent,
                                   className = ''
                               }) => {
    const theme = useStore(state => state.getCurrentTheme());

    return (
        <footer className={`h-8 px-4 flex items-center justify-between border-t ${theme.border} ${className}`}>
            <span className={theme.textMuted}>{leftContent}</span>
            <span className={theme.textMuted}>{rightContent}</span>
        </footer>
    );
};

export default TerminalFooter