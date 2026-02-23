import React, { useEffect, useCallback } from 'react';
import { HandleProps, HandlePosition } from './types';
import { useKGraphContext } from './KGraphProvider';

// Map position to CSS placement
function getPositionStyle(position: HandlePosition): React.CSSProperties {
    const base: React.CSSProperties = {
        position: 'absolute',
        zIndex: 5,
    };

    switch (position) {
        case 'top':
            return { ...base, top: 0, left: '50%', transform: 'translate(-50%, -50%)' };
        case 'bottom':
            return { ...base, bottom: 0, left: '50%', transform: 'translate(-50%, 50%)' };
        case 'left':
            return { ...base, left: 0, top: '50%', transform: 'translate(-50%, -50%)' };
        case 'right':
            return { ...base, right: 0, top: '50%', transform: 'translate(50%, -50%)' };
    }
}

interface KGraphHandleProps extends HandleProps {
    nodeId?: string;
    onConnectionStart?: (nodeId: string, handleId: string, type: 'source' | 'target', e: React.MouseEvent) => void;
}

const Handle: React.FC<KGraphHandleProps> = ({
    id,
    type,
    position,
    style,
    className = '',
    nodeId,
    onConnectionStart,
}) => {
    const { registerHandle, unregisterHandle } = useKGraphContext();

    // Registration happens via NodeWrapper which has position knowledge
    // Handle just renders the visual element and provides interaction target

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (type === 'source' && nodeId && onConnectionStart) {
            e.stopPropagation();
            e.preventDefault();
            onConnectionStart(nodeId, id, type, e);
        }
    }, [type, nodeId, id, onConnectionStart]);

    const posStyle = getPositionStyle(position);

    return (
        <div
            className={`kgraph-handle kgraph-handle-${type} kgraph-handle-${position} ${className}`}
            style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                cursor: 'crosshair',
                ...posStyle,
                ...style,
            }}
            data-handleid={id}
            data-handletype={type}
            data-handleposition={position}
            data-nodeid={nodeId}
            onMouseDown={handleMouseDown}
        />
    );
};

export default Handle;
