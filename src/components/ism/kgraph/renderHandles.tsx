import React from 'react';
import { Handle } from '../../../kgraph';

export const renderHandles = (color: string) => {
    const handleStyle: React.CSSProperties = {
        width: 10,
        height: 10,
        background: color,
        border: '2px solid rgba(255,255,255,0.3)',
        borderRadius: '50%',
    };

    return (
        <>
            <Handle id="target-1" type="target" position="top" style={handleStyle} />
            <Handle id="source-1" type="source" position="top" style={{ ...handleStyle, opacity: 0 }} />
            <Handle id="target-2" type="target" position="left" style={handleStyle} />
            <Handle id="source-2" type="source" position="left" style={{ ...handleStyle, opacity: 0 }} />
            <Handle id="target-3" type="target" position="right" style={handleStyle} />
            <Handle id="source-3" type="source" position="right" style={{ ...handleStyle, opacity: 0 }} />
            <Handle id="target-4" type="target" position="bottom" style={handleStyle} />
            <Handle id="source-4" type="source" position="bottom" style={{ ...handleStyle, opacity: 0 }} />
        </>
    );
};
