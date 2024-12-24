import React from 'react';

export default ({ fromX, fromY, toX, toY }) => {
    return (
        <g>
            <path
                fill="none"
                stroke="red"
                strokeWidth={1.5}
                className="animated"
                d={`M${fromX},${fromY} C ${fromX} ${toY} ${fromX} ${toY} ${toX},${toY}`}
            />
            <circle
                cx={toX}
                cy={toY}
                fill="red"
                r={3}
                stroke="red"
                strokeWidth={1.5}
            />
        </g>
    );
};
