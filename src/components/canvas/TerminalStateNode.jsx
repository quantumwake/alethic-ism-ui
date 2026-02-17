// Custom State Node component for canvas
import { useEffect, useRef, useState } from "react";

const TerminalStateNode = ({ data, position, id, onPositionChange, selected, onSelect, theme }) => {
    const nodeRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        if (nodeRef.current) {
            const rect = nodeRef.current.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const offsetY = e.clientY - rect.top;
            setDragOffset({ x: offsetX, y: offsetY });
            setIsDragging(true);
            onSelect(id);
        }
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging && nodeRef.current) {
                const newX = e.clientX - dragOffset.x;
                const newY = e.clientY - dragOffset.y;
                onPositionChange(id, { x: newX, y: newY });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset, id, onPositionChange]);

    return (
        <div
            ref={nodeRef}
            className={`absolute bg-gradient-to-br from-midnight-success/30 via-midnight-elevated to-midnight-surface rounded-lg border-2 ${selected ? 'border-midnight-success-bright shadow-midnight-success' : 'border-midnight-border'} min-w-[200px] transition-all duration-200`}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleMouseDown}
        >
            <div className="flex items-center justify-between p-2 border-b border-midnight-border/50">
                <div className="flex items-center gap-2">
                    <span className="py-0.5 px-2 text-xs bg-midnight-success/20 text-midnight-success-bright rounded">
                        {data.type || 'state'}
                    </span>
                </div>
            </div>

            <div className="flex flex-col text-midnight-text-body p-4">
                <div className="text-sm text-white font-medium">{data.name}</div>
                {data.count !== undefined && (
                    <div className="text-xs text-midnight-success-bright mt-1">
                        {data.count > 0 ? `${data.count} rows` : 'Empty'}
                    </div>
                )}

                <div className="mt-4 flex justify-between">
                    <div
                        className="w-3 h-3 rounded-full bg-midnight-success border border-white/30 cursor-pointer hover:bg-midnight-success-bright transition-colors"
                        data-handle="input"
                        data-node-id={id}
                    />
                    <div
                        className="w-3 h-3 rounded-full bg-midnight-success border border-white/30 cursor-pointer hover:bg-midnight-success-bright transition-colors"
                        data-handle="output"
                        data-node-id={id}
                    />
                </div>
            </div>
        </div>
    );
};

export default TerminalStateNode;
