import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStore } from '../../../store';
import { TerminalDialog, TerminalButton } from '../../../components/common';
import { GripVertical } from 'lucide-react';

function SortableItem({ id, column, index }) {
    const theme = useStore(state => state.getCurrentTheme());
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-2 px-2 py-1.5 border ${theme.border} ${theme.bg} ${isDragging ? 'border-amber-500' : ''}`}
        >
            <button
                {...attributes}
                {...listeners}
                className={`cursor-grab active:cursor-grabbing ${theme.text} opacity-50 hover:opacity-100`}
            >
                <GripVertical className="w-3 h-3" />
            </button>
            <span className={`${theme.text} opacity-40 text-xs font-mono w-6`}>
                {index + 1}
            </span>
            <span className={`${theme.text} ${theme.font} font-mono text-xs truncate flex-1`}>
                {column.name || `(unnamed)`}
            </span>
        </div>
    );
}

function StateColumnOrderDialog({ isOpen, onClose, columns, onSave }) {
    const theme = useStore(state => state.getCurrentTheme());
    const [orderedColumns, setOrderedColumns] = useState([]);

    React.useEffect(() => {
        if (isOpen && columns) {
            // Filter out deleted columns and create a working copy
            const activeColumns = columns
                .filter(c => !c.deleted)
                .map((col, idx) => ({
                    ...col,
                    _sortId: col.id || `temp-${idx}`,
                }));
            setOrderedColumns(activeColumns);
        }
    }, [isOpen, columns]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setOrderedColumns((items) => {
                const oldIndex = items.findIndex(i => i._sortId === active.id);
                const newIndex = items.findIndex(i => i._sortId === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleSave = () => {
        // Update display_order based on new positions
        const updatedColumns = orderedColumns.map((col, idx) => ({
            ...col,
            display_order: idx + 1,
        }));
        // Remove the temp _sortId
        updatedColumns.forEach(col => delete col._sortId);
        onSave(updatedColumns);
        onClose();
    };

    return (
        <TerminalDialog
            isOpen={isOpen}
            onClose={onClose}
            title="Organize Columns"
            width="w-full max-w-4xl"
        >
            <div className="space-y-4">
                <div className={`${theme.text} text-xs opacity-70`}>
                    Drag to reorder. Order reads left-to-right, top-to-bottom.
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={orderedColumns.map(c => c._sortId)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-0.5 max-h-[60vh] overflow-y-auto p-1"
                            style={{ maxHeight: 'calc(60vh - 100px)' }}
                        >
                            {orderedColumns.map((column, index) => (
                                <SortableItem
                                    key={column._sortId}
                                    id={column._sortId}
                                    column={column}
                                    index={index}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                {orderedColumns.length === 0 && (
                    <div className={`${theme.text} opacity-50 text-center py-8`}>
                        No columns to organize
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-opacity-20">
                    <TerminalButton variant="secondary" onClick={onClose}>
                        Cancel
                    </TerminalButton>
                    <TerminalButton variant="primary" onClick={handleSave}>
                        Save Order
                    </TerminalButton>
                </div>
            </div>
        </TerminalDialog>
    );
}

export default StateColumnOrderDialog;