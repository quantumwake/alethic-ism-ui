import React from 'react';
import useStore from '../../store';

const TerminalTabViewToolButton = ({
                             children,
                             className = "",
                             spacing = "gap-2",
                             padding = "p-2"
                         }) => {
    const theme = useStore(state => state.getCurrentTheme());

    return (
        <div className={`${theme.font} ${theme.bg} ${padding} flex items-center ${spacing} border-b ${theme.border} ${className}`}>
            {children}
        </div>
    );
};


export default TerminalTabViewToolButton;