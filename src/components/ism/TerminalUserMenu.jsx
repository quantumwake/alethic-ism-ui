import React, { useState, useRef, useEffect } from 'react';
import {
    User,
    LogOut,
    Settings,
    Palette,
    Languages,
    ChevronRight
} from 'lucide-react';
import {useStore} from '../../store';

const TerminalUserMenu = ({
                             onThemeChange,
                             onLanguageChange,
                             onAppearanceChange,
                             onSettingsClick,
                             onProfileClick,
                             onLogout
                         }) => {

    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const theme = useStore(state => state.getCurrentTheme());
    const logout = useStore(state => state.logout);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
                { id: 'matrix', label: 'Matrix', },
                { id: 'amber', label: 'Amber', },
                { id: 'pro', label: 'Pro', },
                // { id: 'ibm', label: 'IBM Blue', },
                // { id: 'minimal', label: 'Minimal', },
                // { id: 'modern', label: 'Modern', },
                // { id: 'terminalNoir', label: 'Terminal Noir', },
                // { id: 'neoVintage', label: 'Neo Vintage', },
            ]
        },
        {
            id: 'language',
            label: 'Language',
            icon: Languages,
            command: 'set lang',
            subItems: [
                { id: 'en', label: 'English', },
                { id: 'es', label: 'Español', },
                { id: 'fr', label: 'Français', },
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
    ];

    const [activeSubmenu, setActiveSubmenu] = useState(null);

    const handleItemClick = (item, subItem = null) => {
        console.log(item)

        if (item.subItems) {
            setActiveSubmenu(activeSubmenu === item.id ? null : item.id);
        }

        if (!subItem) {
            return
        }

        switch (item.id) {
            case 'theme':
                onThemeChange(subItem.id)
                break;
        }
    };

    const renderMenuItem = (item) => {
        const Icon = item.icon;
        const hasSubItems = item.subItems?.length > 0;
        const isSubmenuOpen = activeSubmenu === item.id;

        return (
            <div key={item.id}>
                <button
                    onClick={() => handleItemClick(item)}
                    className={`w-full text-left px-2 py-1.5 ${theme.hover} flex items-center gap-2 group
                    ${item.danger ? theme.textAccent : theme.text}`}>
                    <Icon className={`w-3 h-3 ${theme.icon}`} />
                    <span className="text-xs">{item.label}</span>
                    {hasSubItems && (
                        <ChevronRight className={`w-3 h-3 ${theme.icon} ml-auto transform transition-transform
                        ${isSubmenuOpen ? 'rotate-90' : ''}`}/>
                    )}
                </button>

                {isSubmenuOpen && item.subItems && (
                    <div className="ml-4 border-l pl-2 space-y-1">
                        {item.subItems.map(subItem => (
                            <button
                                key={subItem.id}
                                onClick={() => handleItemClick(item, subItem)}
                                className={`w-full text-left px-2 py-1 ${theme.hover} flex items-center gap-2`}>
                                <span className={theme.textMuted}>{'>'}</span>
                                {subItem.icon && <subItem.icon className={`w-3 h-3 ${theme.icon}`} />}
                                <span className={`text-xs ${theme.text}`}>{subItem.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div ref={menuRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-1 rounded ${theme.hover} flex items-center gap-2`}>
                <User className={`w-4 h-4 ${theme.icon}`} />
            </button>

            {isOpen && (
                <div className={`absolute right-0 top-full mt-1 w-48 border ${theme.border} ${theme.bg} rounded shadow-lg overflow-hidden z-50`}>
                    {menuItems.map(renderMenuItem)}
                </div>
            )}
        </div>
    );
};

export default TerminalUserMenu;