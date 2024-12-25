import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import {useStore} from '../../store';

export const TerminalCategoryItem = ({ icon: Icon, name, tooltip, enabled, onClick }) => {
    const theme = useStore(state => state.getCurrentTheme());

    return (
        <div
            title={tooltip}
            className={`flex items-center gap-1.5 px-1.5 py-1 text-xs
                ${enabled ? `cursor-pointer ${theme.hover}` : 'opacity-40 cursor-not-allowed'}`}
            onClick={() => enabled && onClick?.()}
        >
            <div className="flex items-center gap-1.5 min-w-0">
                <span className={theme.textAccent}>$</span>
                <Icon className={`w-3 h-3 ${theme.icon}`} />
                <span className={`${theme.text} truncate`}>{name}</span>
            </div>
            {enabled && (
                <Plus className={`w-3 h-3 ml-auto ${theme.textAccent} opacity-0 group-hover:opacity-100`} />
            )}
        </div>
    );
};

export default TerminalCategoryItem