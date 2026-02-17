import { useState } from 'react';

// Edge component to draw connections
// Uses midnight theme colors: accent (#8b5cf6), info-bright (#60a5fa)
const TerminalFlowEdge = ({ source, target, sourcePos, targetPos, selected }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Calculate bezier curve control points
    const controlPoint1X = sourcePos.x + (targetPos.x - sourcePos.x) / 2;
    const controlPoint1Y = sourcePos.y;
    const controlPoint2X = controlPoint1X;
    const controlPoint2Y = targetPos.y;

    const path = `M ${sourcePos.x},${sourcePos.y} C ${controlPoint1X},${controlPoint1Y} ${controlPoint2X},${controlPoint2Y} ${targetPos.x},${targetPos.y}`;

    // Midnight theme colors
    const strokeColor = selected ? '#a78bfa' : (isHovered ? '#60a5fa' : '#8b5cf6');

    return (
        <path
            d={path}
            stroke={strokeColor}
            strokeWidth={selected ? 2.5 : (isHovered ? 2 : 1.5)}
            strokeDasharray="6 3"
            fill="none"
            className="transition-all duration-200 cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        />
    );
};

export default TerminalFlowEdge