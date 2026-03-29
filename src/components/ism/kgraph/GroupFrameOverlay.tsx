import React, { useCallback, useRef, useState } from 'react';
import { Minimize2, Unlink, GripHorizontal, Pencil } from 'lucide-react';
import { useKGraphContext } from '@quantumwake/kgraph';
import type { KGraphNode, NodeChange } from '@quantumwake/kgraph';

interface ExpandedGroup {
    groupId: string;
    groupName: string;
    groupColor: string;
    memberNodeIds: string[];
    bounds: { x: number; y: number; width: number; height: number };
}

interface GroupFrameOverlayProps {
    expandedGroups: ExpandedGroup[];
    rawNodes: KGraphNode[];
    onNodesChange: (changes: NodeChange[]) => void;
    onCollapse: (groupId: string) => void;
    onUngroup: (groupId: string) => void;
    onRename: (groupId: string, newName: string) => void;
    snapToGrid?: boolean;
    snapGrid?: [number, number];
}

const PADDING = 24;
const HEADER_HEIGHT = 28;

export const GroupFrameOverlay: React.FC<GroupFrameOverlayProps> = ({
    expandedGroups,
    rawNodes,
    onNodesChange,
    onCollapse,
    onUngroup,
    onRename,
    snapToGrid = true,
    snapGrid = [16, 16],
}) => {
    const { viewport } = useKGraphContext();
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    // Refs for stable access inside window event listeners
    const rawNodesRef = useRef(rawNodes);
    rawNodesRef.current = rawNodes;
    const onNodesChangeRef = useRef(onNodesChange);
    onNodesChangeRef.current = onNodesChange;
    const zoomRef = useRef(viewport.zoom);
    zoomRef.current = viewport.zoom;
    const snapRef = useRef({ snapToGrid, snapGrid });
    snapRef.current = { snapToGrid, snapGrid };

    const dragRef = useRef<{
        groupId: string;
        startMouseX: number;
        startMouseY: number;
        startPositions: Record<string, { x: number; y: number }>;
        memberIds: string[];
        isDragging: boolean;
    } | null>(null);

    const handleHeaderMouseDown = useCallback((e: React.MouseEvent, groupId: string, memberNodeIds: string[]) => {
        // Don't start drag from buttons or input
        if ((e.target as HTMLElement).closest('button')) return;
        if ((e.target as HTMLElement).closest('input')) return;

        e.stopPropagation();
        e.preventDefault();

        // Snapshot member positions at drag start
        const startPositions: Record<string, { x: number; y: number }> = {};
        for (const nid of memberNodeIds) {
            const node = rawNodesRef.current.find(n => n.id === nid);
            if (node) {
                startPositions[nid] = { x: node.position.x, y: node.position.y };
            }
        }

        dragRef.current = {
            groupId,
            startMouseX: e.clientX,
            startMouseY: e.clientY,
            startPositions,
            memberIds: memberNodeIds,
            isDragging: false,
        };

        const handleMouseMove = (ev: MouseEvent) => {
            const drag = dragRef.current;
            if (!drag) return;

            const zoom = zoomRef.current;
            const dx = (ev.clientX - drag.startMouseX) / zoom;
            const dy = (ev.clientY - drag.startMouseY) / zoom;

            if (!drag.isDragging && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
                drag.isDragging = true;
            }
            if (!drag.isDragging) return;

            const { snapToGrid: snap, snapGrid: grid } = snapRef.current;
            const changes: NodeChange[] = [];
            for (const nid of drag.memberIds) {
                const start = drag.startPositions[nid];
                if (!start) continue;
                let newX = start.x + dx;
                let newY = start.y + dy;
                if (snap) {
                    newX = Math.round(newX / grid[0]) * grid[0];
                    newY = Math.round(newY / grid[1]) * grid[1];
                }
                changes.push({
                    type: 'position',
                    id: nid,
                    position: { x: newX, y: newY },
                    dragging: true,
                });
            }
            if (changes.length) onNodesChangeRef.current(changes);
        };

        const handleMouseUp = (ev: MouseEvent) => {
            const drag = dragRef.current;
            if (drag?.isDragging) {
                const zoom = zoomRef.current;
                const dx = (ev.clientX - drag.startMouseX) / zoom;
                const dy = (ev.clientY - drag.startMouseY) / zoom;
                const { snapToGrid: snap, snapGrid: grid } = snapRef.current;

                const changes: NodeChange[] = [];
                for (const nid of drag.memberIds) {
                    const start = drag.startPositions[nid];
                    if (!start) continue;
                    let newX = start.x + dx;
                    let newY = start.y + dy;
                    if (snap) {
                        newX = Math.round(newX / grid[0]) * grid[0];
                        newY = Math.round(newY / grid[1]) * grid[1];
                    }
                    changes.push({
                        type: 'position',
                        id: nid,
                        position: { x: newX, y: newY },
                        dragging: false,
                    });
                }
                if (changes.length) onNodesChangeRef.current(changes);
            }
            dragRef.current = null;
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, []);

    const startEditing = (groupId: string, currentName: string) => {
        setEditingGroupId(groupId);
        setEditValue(currentName);
    };

    const commitEdit = () => {
        if (editingGroupId && editValue.trim()) {
            onRename(editingGroupId, editValue.trim());
        }
        setEditingGroupId(null);
        setEditValue('');
    };

    if (expandedGroups.length === 0) return null;

    const transformStr = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`;

    return (
        <div
            className="kgraph-group-frame-layer"
            style={{
                position: 'absolute',
                inset: 0,
                transformOrigin: '0 0',
                transform: transformStr,
                pointerEvents: 'none',
                zIndex: 1,
            }}
        >
            {expandedGroups.map(({ groupId, groupName, groupColor, memberNodeIds, bounds }) => (
                <div
                    key={groupId}
                    style={{
                        position: 'absolute',
                        left: bounds.x - PADDING,
                        top: bounds.y - PADDING - HEADER_HEIGHT,
                        width: bounds.width + PADDING * 2,
                        height: bounds.height + PADDING * 2 + HEADER_HEIGHT,
                    }}
                >
                    {/* Header bar — draggable */}
                    <div
                        className="flex items-center gap-1 px-2"
                        style={{
                            height: HEADER_HEIGHT,
                            background: `${groupColor}20`,
                            borderTop: `1.5px solid ${groupColor}60`,
                            borderLeft: `1.5px solid ${groupColor}60`,
                            borderRight: `1.5px solid ${groupColor}60`,
                            borderTopLeftRadius: 4,
                            borderTopRightRadius: 4,
                            pointerEvents: 'all',
                            cursor: 'grab',
                        }}
                        onMouseDown={(e) => handleHeaderMouseDown(e, groupId, memberNodeIds)}
                    >
                        <GripHorizontal className="w-3 h-3 flex-shrink-0 opacity-40" style={{ color: groupColor }} />
                        {editingGroupId === groupId ? (
                            <input
                                className="text-[10px] font-semibold tracking-wide uppercase bg-transparent border-b outline-none flex-1 min-w-0"
                                style={{ color: groupColor, borderColor: groupColor }}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={commitEdit}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') commitEdit();
                                    if (e.key === 'Escape') { setEditingGroupId(null); setEditValue(''); }
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                autoFocus
                            />
                        ) : (
                            <span
                                className="text-[10px] font-semibold tracking-wide uppercase truncate flex-1"
                                style={{ color: groupColor }}
                                onDoubleClick={(e) => { e.stopPropagation(); startEditing(groupId, groupName); }}
                                title="Double-click to rename"
                            >
                                {groupName}
                            </span>
                        )}
                        <button
                            onClick={(e) => { e.stopPropagation(); startEditing(groupId, groupName); }}
                            className="p-0.5 hover:bg-white/10 transition-colors rounded-sm"
                            title="Rename group"
                        >
                            <Pencil className="w-2.5 h-2.5" style={{ color: groupColor, opacity: 0.6 }} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onCollapse(groupId); }}
                            className="p-0.5 hover:bg-white/10 transition-colors rounded-sm"
                            title="Collapse group"
                        >
                            <Minimize2 className="w-3 h-3" style={{ color: groupColor }} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onUngroup(groupId); }}
                            className="p-0.5 hover:bg-red-500/20 transition-colors rounded-sm"
                            title="Ungroup"
                        >
                            <Unlink className="w-3 h-3 text-midnight-text-subdued hover:text-red-400" />
                        </button>
                    </div>
                    {/* Frame body (dashed border, no pointer events) */}
                    <div
                        style={{
                            width: '100%',
                            height: `calc(100% - ${HEADER_HEIGHT}px)`,
                            border: `1.5px dashed ${groupColor}40`,
                            borderTop: 'none',
                            borderBottomLeftRadius: 4,
                            borderBottomRightRadius: 4,
                            background: `${groupColor}06`,
                        }}
                    />
                </div>
            ))}
        </div>
    );
};
