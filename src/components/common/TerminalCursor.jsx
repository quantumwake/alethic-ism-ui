import {useStore} from '../../store';
import React from "react";

export const TerminalCursor = () => {
    const theme = useStore(state => state.getCurrentTheme());

    return (
        <div className={`w-2 h-4 inline-block ml-1 ${theme.textAccent} animate-pulse`}>
            _
        </div>
    );
};

export default TerminalCursor