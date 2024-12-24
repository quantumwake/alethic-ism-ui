import useStore from '../../store';
import React from "react";

export const TerminalSection = ({
                                    title,
                                    children,
                                    className = ''
                                }) => {
    const theme = useStore(state => state.getCurrentTheme());

    return (
        <div className={className}>
            <div className={`px-3 py-2 border-b ${theme.border}`}>
                <span className={theme.textAccent}>&gt; {title.toUpperCase()}</span>
            </div>
            <div className="p-2">
                {children}
            </div>
        </div>
    );
};

export default TerminalSection