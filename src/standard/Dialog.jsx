import React from 'react';
import { X, GripHorizontal } from 'lucide-react';
import {useStore} from "../store";
import ResizableWindow from "./ResizableWindow";

const Dialog = ({
                    isOpen,
                    onClose,
                    title = "Dialog",
                    children,
                    initialPosition = { x: 20, y: 20 },
                    width = "400px",
                }) => {
    const [position, setPosition] = React.useState(initialPosition);
    const [isDragging, setIsDragging] = React.useState(false);
    const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });

    const theme = useStore(state => state.getCurrentTheme());

    const handleMouseDown = (e) => {
        if (e.target.closest('.handle')) {
            setIsDragging(true);
            const rect = e.currentTarget.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    if (!isOpen) return null;

    return (
        <ResizableWindow
            initialSize={{width: 400, height: 600}}
            minSize={{width: 300, height: 400}}
            maxSize={{width: 800, height: 1000}}
            theme={theme}
            onClick={onClose}
            className={`${theme.bg} ${theme.border}`}>

            {/* Dialog */}
            <div className={`shadow-lg font-mono border ${theme.bg} ${theme.border}`}
                style={{
                    left: position.x,
                    top: position.y,
                    width: width,
                    cursor: isDragging ? 'grabbing' : 'auto',
                    zIndex: 50
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}>

                <div className={`flex items-center justify-between px-2 py-1 handle cursor-grab border-b ${theme.border}`}>
                    <div className="flex items-center gap-1.5">
                        <GripHorizontal className={`w-3 h-3 ${theme.textAccent}`} />
                        <span className={`text-xs ${theme.text}`}>{title}</span>
                    </div>
                    <button onClick={onClose} className={`p-0.5 ${theme.hover} ${theme.textAccent}`}>
                        <X className="w-3 h-3" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-1.5 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {children}
                </div>
            </div>
        </ResizableWindow>
    );
};

export default Dialog;