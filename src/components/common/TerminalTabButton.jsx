import {useStore} from '../../store';
import React from "react";

export const TerminalTabButton = ({
                                      isActive,
                                      onClick,
                                      children,
                                      icon
                                  }) => {
    const theme = useStore(state => state.getCurrentTheme());

    return (
        <button
            onClick={onClick}
            className={`
                flex 
                items-center 
                justify-center 
                w-full 
                p-2
                ${isActive ? theme.textAccent : theme.text}
                ${theme.hover}
            `}>
            {children || icon}
        </button>
    );
};

export default TerminalTabButton