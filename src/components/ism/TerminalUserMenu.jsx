import React, {useRef, useState} from 'react';
import {
    User,
    LogOut,
    Settings,
    Palette,
    Languages,
} from 'lucide-react';
import { useStore } from '../../store';
import { TerminalContextMenu } from '../common/TerminalContextMenu';

const TerminalUserMenu = ({
                              onThemeChange,
                              onLanguageChange,
                              onAppearanceChange,
                              onSettingsClick,
                              onProfileClick,
                              onLogout
                          }) => {

    const containerRef = useRef(null)
    const theme = useStore(state => state.getCurrentTheme())
    const [isOpen, setIsOpen] = useState(false)
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
    const menuItems = [
        {
            id: 'profile',
            label: 'Profile Settings',
            icon: User,
            command: 'user profile',
        },
        {
            id: 'theme',
            label: 'Theme',
            icon: Palette,
            command: 'set theme',
            subItems: [
                { id: 'matrix', label: 'Matrix' },
                { id: 'amber', label: 'Amber' },
                { id: 'pro', label: 'Pro' },
                { id: 'hybrid', label: 'Hybrid' },
                { id: 'light', label: 'Light' },
                { id: 'crimson', label: 'Crimson' },
                { id: 'cyber', label: 'Cyber' },
            ]
        },
        {
            id: 'language',
            label: 'Language',
            icon: Languages,
            command: 'set lang',
            subItems: [
                { id: 'en', label: 'English' },
                { id: 'es', label: 'Español' },
                { id: 'fr', label: 'Français' },
            ]
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: Settings,
            command: 'settings',
        },
        {
            id: 'logout',
            label: 'Logout',
            icon: LogOut,
            command: 'logout',
            danger: true
        }
    ]

    const handleItemClick = (item, subItem = null) => {
        if (!subItem) {
            return;
        }

        switch (item.id) {
            case 'theme':
                onThemeChange?.(subItem.id);
                break;
            case 'language':
                onLanguageChange?.(subItem.id);
                break;
        }
    };

    const handleClick = (e, item) => {
        e.preventDefault();
        e.stopPropagation();

        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();

        // Get menu dimensions
        const menuWidth = containerRef.current ? containerRef.current.offsetWidth : 200; // fallback width
        const menuHeight = containerRef.current ? containerRef.current.offsetHeight : 150; // fallback height

        // Calculate available space
        const spaceRight = window.innerWidth - rect.right;
        const spaceBottom = window.innerHeight - rect.bottom;

        // Determine position
        let x = rect.left;
        let y = rect.bottom;

        // Adjust horizontal position if needed
        if (spaceRight < menuWidth && rect.left > menuWidth) {
            x = rect.right - menuWidth;
        }

        // Adjust vertical position if needed
        if (spaceBottom < menuHeight && rect.top > menuHeight) {
            y = rect.top - menuHeight;
        }

        setMenuPosition({ x, y });
        setIsOpen(true);
    };

    return (
        <div>
            <button onClick={handleClick}
                className={`p-1 rounded ${theme.hover} flex items-center gap-2`}>
                <User className={`w-4 h-4 ${theme.icon}`}/>
            </button>

            <TerminalContextMenu menuRef={containerRef} isOpen={isOpen} setIsOpen={setIsOpen}
                menuItems={menuItems}
                menuPosition={menuPosition}
                onItemClick={handleItemClick}
            />
        </div>
    );
};

export default TerminalUserMenu;