import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { useStore } from '../../store';

export const TerminalContextMenu = ({
                                        trigger,
                                        menuItems,
                                        onItemClick,
                                        isOpen,
                                        setIsOpen,
                                        className = "",
                                        menuRef,
                                        menuPosition = { x: 0, y: 0 }
                                    }) => {
    const [activeSubmenu, setActiveSubmenu] = useState(null);
    const theme = useStore(state => state.getCurrentTheme());
    // const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
                setActiveSubmenu(null);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen, setIsOpen]);

    const handleItemClick = (item, subItem = null) => {
        if (item.subItems) {
            setActiveSubmenu(activeSubmenu === item.id ? null : item.id);
            onItemClick(item, subItem);
            return
        }

        if (onItemClick) {
            onItemClick(item, subItem);
        }

        if (!item.subItems) {
            setIsOpen(false);
            setActiveSubmenu(null);
        }
    };

    const renderMenuItem = (item) => {
        const Icon = item.icon;
        const hasSubItems = item.subItems?.length > 0;
        const isSubmenuOpen = activeSubmenu === item.id;

        return (
            <div key={item.id}>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        handleItemClick(item)
                    }}
                    className={`w-full text-left px-2 py-1.5 ${theme.hover} flex items-center gap-2 group
                    ${item.danger ? theme.textAccent : theme.text}`}>
                    {Icon && <Icon className={`w-3 h-3 ${theme.icon}`}/>}
                    <span className="text-xs">{item.label}</span>
                    {hasSubItems && (
                        <ChevronRight
                            className={`w-3 h-3 ${theme.icon} ml-auto transform transition-transform
                            ${isSubmenuOpen ? 'rotate-90' : ''}`}
                        />
                    )}
                </button>

                {isSubmenuOpen && item.subItems && (
                    <div className="ml-4 border-l pl-2 space-y-1">
                        {item.subItems.map(subItem => (
                            <button
                                key={subItem.id}
                                onClick={() => handleItemClick(item, subItem)}
                                className={`w-full text-left px-2 py-1 ${theme.hover} flex items-center gap-2`}
                            >
                                {/*<span className={theme.textMuted}>{'>'}</span>*/}
                                {subItem.icon && <subItem.icon className={`w-3 h-3 ${theme.icon}`} />}
                                <span className={`text-xs ${theme.text}`}>{subItem.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div ref={menuRef} className={`fixed ${theme.border} ${theme.bg} rounded shadow-lg overflow-hidden z-50 ${className}`}
            style={{
                width: '12rem',
                left: `${menuPosition.x}px`,
                top: `${menuPosition.y}px`
            }}>
            {menuItems.map(renderMenuItem)}
        </div>
    );
};

export default TerminalContextMenu;