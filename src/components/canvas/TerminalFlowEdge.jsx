// Edge component to draw connections
const TerminalFlowEdge = ({ source, target, sourcePos, targetPos }) => {
    // Calculate bezier curve control points
    const controlPoint1X = sourcePos.x + (targetPos.x - sourcePos.x) / 2;
    const controlPoint1Y = sourcePos.y;
    const controlPoint2X = controlPoint1X;
    const controlPoint2Y = targetPos.y;

    const path = `M ${sourcePos.x},${sourcePos.y} C ${controlPoint1X},${controlPoint1Y} ${controlPoint2X},${controlPoint2Y} ${targetPos.x},${targetPos.y}`;

    return (
        <path
            d={path}
            stroke="#6B7280"
            strokeWidth="2"
            fill="none"
            className="transition-colors duration-200 hover:stroke-blue-500"
        />
    );
};

export default TerminalFlowEdge