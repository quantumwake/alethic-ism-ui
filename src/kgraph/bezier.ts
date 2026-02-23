import { HandlePosition } from './types';

/**
 * Compute a cubic bezier path between two points with directional control points.
 * Drop-in replacement for ReactFlow's getBezierPath.
 *
 * Returns [pathString, labelX, labelY, offsetX, offsetY]
 */
export function getBezierPath({
    sourceX,
    sourceY,
    sourcePosition = 'bottom',
    targetX,
    targetY,
    targetPosition = 'top',
    curvature = 0.25,
}: {
    sourceX: number;
    sourceY: number;
    sourcePosition?: HandlePosition;
    targetX: number;
    targetY: number;
    targetPosition?: HandlePosition;
    curvature?: number;
}): [string, number, number, number, number] {
    const [cp1x, cp1y] = getControlPoint(sourceX, sourceY, sourcePosition, curvature, sourceX, sourceY, targetX, targetY);
    const [cp2x, cp2y] = getControlPoint(targetX, targetY, targetPosition, curvature, sourceX, sourceY, targetX, targetY);

    const path = `M ${sourceX},${sourceY} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${targetX},${targetY}`;

    // Midpoint of cubic bezier at t=0.5
    const t = 0.5;
    const labelX = cubicBezier(t, sourceX, cp1x, cp2x, targetX);
    const labelY = cubicBezier(t, sourceY, cp1y, cp2y, targetY);

    const offsetX = Math.abs(targetX - sourceX) * curvature;
    const offsetY = Math.abs(targetY - sourceY) * curvature;

    return [path, labelX, labelY, offsetX, offsetY];
}

function getControlPoint(
    x: number,
    y: number,
    position: HandlePosition,
    curvature: number,
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number,
): [number, number] {
    const dx = Math.abs(targetX - sourceX);
    const dy = Math.abs(targetY - sourceY);
    const distance = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
    const offset = Math.max(distance * curvature, 50);

    switch (position) {
        case 'top':
            return [x, y - offset];
        case 'bottom':
            return [x, y + offset];
        case 'left':
            return [x - offset, y];
        case 'right':
            return [x + offset, y];
        default:
            return [x, y + offset];
    }
}

function cubicBezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
    const mt = 1 - t;
    return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}
