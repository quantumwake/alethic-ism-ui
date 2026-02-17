// Custom Node component based on your example
import {useEffect, useRef, useState} from "react";

const TerminalFlowNode = ({ data, position, id, onPositionChange, selected, onSelect, theme }) => {
    const nodeRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0, dx: 0, dy: 0 });

    const handleMouseDown = (e) => {
        if (nodeRef.current) {
            const rect = nodeRef.current.getBoundingClientRect();
            const offsetX = e.clientX - rect.left
            const offsetY = e.clientY - rect.top
            // const displacementX = e.pageX - offsetX
            // const displacementY = e.pageY - offsetY
            setDragOffset({
                x: offsetX,
                y: offsetY,
                // dx: displacementX,
                // dy: displacementY
            });
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
            className={`absolute bg-midnight-surface rounded-lg border-2 ${selected ? 'border-midnight-info shadow-midnight-info' : 'border-midnight-border'} min-w-[200px] transition-all duration-200`}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleMouseDown}
        >
            <div className="flex items-center justify-between p-2 border-b border-midnight-border/50">
                <div className="flex items-center gap-2">
                    <span className="py-0.5 px-2 text-xs bg-midnight-elevated text-midnight-text-label rounded">
                        {data.type}
                    </span>
                </div>
            </div>

            <div className="flex flex-col text-midnight-text-body p-4">
                <div className="text-sm">{data.name}</div>

                <div className="mt-4 flex justify-between">
                    <div
                        className="w-3 h-3 rounded-full bg-midnight-raised border border-white/30 cursor-pointer hover:bg-midnight-info transition-colors"
                        data-handle="input"
                        data-node-id={id}
                    />
                    <div
                        className="w-3 h-3 rounded-full bg-midnight-raised border border-white/30 cursor-pointer hover:bg-midnight-info transition-colors"
                        data-handle="output"
                        data-node-id={id}
                    />
                </div>
            </div>
        </div>
    );
};

export default TerminalFlowNode