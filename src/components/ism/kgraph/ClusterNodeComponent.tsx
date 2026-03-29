import React, { useState } from 'react';
import type { NodeComponentProps } from '@quantumwake/kgraph';
import { Layers, Maximize2, Unlink, Pencil } from 'lucide-react';
import { useStore } from '../../../store';
import { renderHandles } from './renderHandles';

export const ClusterNodeComponent: React.FC<NodeComponentProps> = ({ id, data, selected }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const { toggleGroupCollapse, deleteGroup, renameGroup } = useStore();

    const groupId = data?.groupId as string;
    const groupName = (data?.groupName as string) || 'Group';
    const groupColor = (data?.groupColor as string) || '#6366f1';
    const memberCount = (data?.memberCount as number) || 0;

    const handleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (groupId) toggleGroupCollapse(groupId);
    };

    const handleUngroup = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (groupId) deleteGroup(groupId);
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (groupId) toggleGroupCollapse(groupId);
    };

    const startEditing = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditValue(groupName);
        setIsEditing(true);
    };

    const commitEdit = () => {
        if (groupId && editValue.trim()) {
            renameGroup(groupId, editValue.trim());
        }
        setIsEditing(false);
        setEditValue('');
    };

    return (
        <div style={{ width: 160, height: 80 }}>
            <div
                className={`w-[160px] h-[80px] relative flex flex-col items-center justify-center cursor-pointer transition-all duration-200`}
                style={{
                    background: `${groupColor}15`,
                    border: `2px dashed ${selected ? groupColor : groupColor + '80'}`,
                    boxShadow: selected ? `0 0 12px ${groupColor}40` : 'none',
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onDoubleClick={handleDoubleClick}
            >
                {renderHandles(groupColor)}

                {/* Hover toolbar */}
                {(isHovered || selected) && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-1 z-50">
                        <button
                            onClick={handleExpand}
                            className="px-2 py-0.5 text-[10px] bg-midnight-surface border border-midnight-border hover:border-midnight-border-glow text-midnight-text-body hover:text-white transition-colors"
                            title="Expand group"
                        >
                            <Maximize2 className="w-3 h-3 inline mr-1" />
                            Expand
                        </button>
                        <button
                            onClick={startEditing}
                            className="px-2 py-0.5 text-[10px] bg-midnight-surface border border-midnight-border hover:border-midnight-border-glow text-midnight-text-body hover:text-white transition-colors"
                            title="Rename group"
                        >
                            <Pencil className="w-3 h-3 inline mr-1" />
                            Rename
                        </button>
                        <button
                            onClick={handleUngroup}
                            className="px-2 py-0.5 text-[10px] bg-midnight-surface border border-midnight-border hover:border-red-500/50 text-midnight-text-body hover:text-red-400 transition-colors"
                            title="Ungroup (remove group)"
                        >
                            <Unlink className="w-3 h-3 inline mr-1" />
                            Ungroup
                        </button>
                    </div>
                )}

                {/* Icon + name */}
                <Layers className="w-5 h-5 mb-1" style={{ color: groupColor }} />
                {isEditing ? (
                    <input
                        className="text-xs font-semibold text-center bg-transparent border-b outline-none max-w-[140px] px-2"
                        style={{ color: groupColor, borderColor: groupColor }}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') commitEdit();
                            if (e.key === 'Escape') { setIsEditing(false); setEditValue(''); }
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                    />
                ) : (
                    <span className="text-xs font-semibold truncate max-w-[140px] px-2" style={{ color: groupColor }}>
                        {groupName}
                    </span>
                )}
                <span className="text-[10px] text-midnight-text-subdued">
                    {memberCount} node{memberCount !== 1 ? 's' : ''}
                </span>
            </div>
        </div>
    );
};
