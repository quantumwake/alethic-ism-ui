import {Search} from "lucide-react";
import React from "react";
import {useStore} from '../../store';

export const TerminalSearchBar = ({ value, onChange }) => {
    const theme = useStore(state => state.getCurrentTheme());

    return (
        <div className="relative">
            <Search className={`absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 ${theme.textAccent}`} />
            <input
                type="text"
                placeholder="search..."
                className={`w-full pl-6 pr-2 py-1 text-xs ${theme.text} ${theme.input} 
                    placeholder:${theme.textMuted} focus:outline-none focus:ring-1 border`}
                value={value}
                onChange={onChange}
            />
        </div>
    );
};

export default TerminalSearchBar