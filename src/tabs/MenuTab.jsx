import React from 'react';
import useStore from '../store';
import { Home, Settings, Users, Activity } from 'lucide-react';

export const MenuTab = ({ onItemClick }) => {
    const theme = useStore(state => state.getCurrentTheme());

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'team', label: 'Team', icon: Users },
        { id: 'analytics', label: 'Analytics', icon: Activity }
    ];

    return (
        <nav className="space-y-1 p-2">
            {menuItems.map(item => {
                const Icon = item.icon;
                return (
                    <button
                        key={item.id}
                        onClick={() => onItemClick?.(item)}
                        className={`w-full text-left px-3 py-2 ${theme.hover} flex items-center gap-2`}
                    >
                        <span className={theme.textAccent}>$</span>
                        <Icon className={`w-4 h-4 ${theme.icon}`} />
                        <span className={theme.text}>{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
};

export default MenuTab