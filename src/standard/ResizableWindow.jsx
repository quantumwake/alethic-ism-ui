import React, { useState, useRef, useEffect } from 'react';

const ResizableWindow = ({
                             children,
                             initialPosition = { x: 20, y: 20 },
                             initialSize = { width: 400, height: 500 },
                             minSize = { width: 200, height: 200 },
                             maxSize = { width: 800, height: 800 },
                             theme,
                             className = "",
                             onClose,
                             isMinimized = false // Add this prop
                         }) => {
    const [position, setPosition] = useState(initialPosition);
    const [size, setSize] = useState(initialSize);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [resizeDirection, setResizeDirection] = useState(null);
    const windowRef = useRef(null);

    const handleMouseDown = (e) => {
        if (e.target.closest('.handle')) {
            setIsDragging(true);
            const rect = windowRef.current.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };

    const handleResizeStart = (direction, e) => {
        e.stopPropagation();
        setIsResizing(true);
        setResizeDirection(direction);
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y
            });
        }

        if (isResizing) {
            const rect = windowRef.current.getBoundingClientRect();
            let newWidth = size.width;
            let newHeight = size.height;

            switch (resizeDirection) {
                case 'e':
                    newWidth = Math.max(minSize.width, Math.min(maxSize.width, e.clientX - rect.left));
                    break;
                case 's':
                    newHeight = Math.max(minSize.height, Math.min(maxSize.height, e.clientY - rect.top));
                    break;
                case 'se':
                    newWidth = Math.max(minSize.width, Math.min(maxSize.width, e.clientX - rect.left));
                    newHeight = Math.max(minSize.height, Math.min(maxSize.height, e.clientY - rect.top));
                    break;
                default:
                    break;
            }

            setSize({ width: newWidth, height: newHeight });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
        setResizeDirection(null);
    };

    useEffect(() => {
        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, isResizing]);

    return (
        <div ref={windowRef} className={`fixed shadow-lg font-mono ${className}`}
            style={{
                left: position.x,
                top: position.y,
                width: size.width,
                height: size.height,
                cursor: isDragging ? 'grabbing' : 'default',
                zIndex: 50
            }}
            onMouseDown={handleMouseDown}>
            {children}

            {/* Resize handles */}
            <div
                className={`absolute right-0 top-0 bottom-0 w-1 cursor-e-resize ${theme.border} hover:${theme.textAccent}`}
                onMouseDown={(e) => handleResizeStart('e', e)}
            />
            <div
                className={`absolute left-0 right-0 bottom-0 h-1 cursor-s-resize ${theme.border} hover:${theme.textAccent}`}
                onMouseDown={(e) => handleResizeStart('s', e)}
            />
            <div
                className={`absolute right-0 bottom-0 w-2 h-2 cursor-se-resize ${theme.border} hover:${theme.textAccent}`}
                onMouseDown={(e) => handleResizeStart('se', e)}
            />
        </div>
    );
};

export default ResizableWindow;