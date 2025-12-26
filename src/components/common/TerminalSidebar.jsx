import {useStore} from '../../store';
import React, {useState, useCallback, useEffect} from "react";

export const TerminalSidebar = ({
                                    isOpen,
                                    onToggle,
                                    tabContent,
                                    mainContent,
                                    className,
                                    position = 'left',
                                    defaultWidth = 384,
                                    minWidth = 200,
                                    maxWidth = 600,
                                    collapsedWidth = 48
                                }) => {
    const theme = useStore(state => state.getCurrentTheme());
    const [width, setWidth] = useState(defaultWidth);
    const [isResizing, setIsResizing] = useState(false);

    const startResizing = useCallback((e) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback((e) => {
        if (!isResizing) return;

        let newWidth;
        if (position === 'left') {
            newWidth = e.clientX;
        } else {
            newWidth = window.innerWidth - e.clientX;
        }

        if (newWidth >= minWidth && newWidth <= maxWidth) {
            setWidth(newWidth);
        }
    }, [isResizing, position, minWidth, maxWidth]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
        }
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizing, resize, stopResizing]);

    const resizeHandle = (
        <div
            onMouseDown={startResizing}
            className={`w-1 cursor-col-resize hover:bg-blue-500/50 active:bg-blue-500 ${isResizing ? 'bg-blue-500' : ''}`}
            style={{ flexShrink: 0 }}
        />
    );

    return (
        <aside
            className={`flex ${position === 'left' ? 'border-r' : 'border-l'} ${theme.border} ${className}`}
            style={{
                width: isOpen ? width : collapsedWidth,
                transition: isResizing ? 'none' : 'width 0.2s',
                flexShrink: 0
            }}
        >
            {position === 'left' ? (
                <>
                    {tabContent}
                    {isOpen && mainContent}
                    {isOpen && resizeHandle}
                </>
            ) : (
                <>
                    {isOpen && resizeHandle}
                    {isOpen && mainContent}
                    {tabContent}
                </>
            )}
        </aside>
    );
};

export default TerminalSidebar