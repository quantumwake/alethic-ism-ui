import React from 'react';
import useStore from '../../store';

export const TerminalFileInput = ({
                              onChange,
                              accept,
                              icon = null,
                              className = ''
                          }) => {
    const theme = useStore(state => state.getCurrentTheme());

    return (
        <div className={`flex items-center gap-2 ${theme.border} border rounded p-2 ${className}`}>
            {icon}
            <input
                type="file"
                accept={accept}
                onChange={onChange}
                className={`text-xs ${theme.text} file:mr-4 file:py-1 file:px-4 
                    file:border-0 file:text-xs file:font-medium file:bg-transparent
                    hover:file:${theme.hover} file:${theme.text} w-full`}
            />
        </div>
    );
};

export default TerminalFileInput