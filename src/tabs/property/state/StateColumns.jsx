import {useStore} from "../../../store";
import React, { useEffect, useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { TerminalInput, TerminalToggle, TerminalButton} from "../../../components/common";
import { MinusSquareIcon, ListOrdered } from "lucide-react";
import StateColumnOrderDialog from "./StateColumnOrderDialog";

function StateColumns({ nodeId }) {
    const theme = useStore(state => state.getCurrentTheme());
    const [columns, setColumns] = useState([]);
    const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
    const getNodeDataColumns = useStore(state => state.getNodeDataColumns);
    const setNodeDataColumns = useStore(state => state.setNodeDataColumns);

    useEffect(() => {
        const stateColumns = getNodeDataColumns(nodeId);
        setColumns(stateColumns);
    }, [nodeId, getNodeDataColumns]);

    const handleAddColumn = () => {
        const maxDisplayOrder = columns.reduce((max, col) => 
            Math.max(max, col.display_order || 0), 0
        );
        const newColumn = {
            id: null,
            name: "",
            value: "",
            callable: false,
            required: false,
            display_order: maxDisplayOrder + 1
        };
        const newColumns = [...columns, newColumn];
        setColumns(newColumns);
        setNodeDataColumns(nodeId, newColumns);
    };

    const handleUpdateField = (index, field, value) => {
        const newColumns = [...columns];
        newColumns[index] = { ...newColumns[index], [field]: value };
        setColumns(newColumns);
        setNodeDataColumns(nodeId, newColumns);
    };

    const handleRemoveField = (index) => {
        const newColumns = [...columns];
        if (newColumns[index].id) {
            newColumns[index].deleted = true;
        } else {
            newColumns.splice(index, 1);
        }
        setColumns(newColumns);
        setNodeDataColumns(nodeId, newColumns);
    };

    const handleOrderSave = (orderedColumns) => {
        // Merge with deleted columns (keep them at the end)
        const deletedColumns = columns.filter(c => c.deleted);
        const newColumns = [...orderedColumns, ...deletedColumns];
        setColumns(newColumns);
        setNodeDataColumns(nodeId, newColumns);
    };

    return (
        <div className={`${theme.spacing.base} flex flex-col space-y-4`}>
            <div className="flex gap-2">
                <TerminalButton
                    variant="ghost"
                    onClick={handleAddColumn}
                    icon={<PlusIcon className="w-4 h-4" />}
                >
                    Add Column
                </TerminalButton>
                <TerminalButton
                    variant="ghost"
                    onClick={() => setIsOrderDialogOpen(true)}
                    icon={<ListOrdered className="w-4 h-4" />}
                    disabled={columns.filter(c => !c.deleted).length < 2}
                >
                    Organize
                </TerminalButton>
            </div>

            {columns.map((item, index) => !item.deleted && (
                <div key={index} className={`flex flex-col space-y-2 p-2 border ${theme.border} border-opacity-50`}>
                    <div className="flex justify-between items-center">
                        <span className={`${theme.text} ${theme.font} text-sm opacity-70`}>
                            #{item.display_order || index + 1} - {item.name || '(unnamed)'}
                        </span>
                        <TerminalButton className="border-0"
                            onClick={() => handleRemoveField(index)}
                        ><MinusSquareIcon className="w-4 h-4"/></TerminalButton>
                    </div>

                    <div className="space-y-2">
                        <TerminalInput
                            value={item.name}
                            onChange={(e) => handleUpdateField(index, "name", e.target.value)}
                            placeholder="Column name"
                        />

                        <TerminalInput
                            value={item.value}
                            onChange={(e) => handleUpdateField(index, "value", e.target.value)}
                            placeholder="Column value"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <TerminalToggle
                                label="Required"
                                checked={item.required}
                                onChange={(checked) => handleUpdateField(index, "required", checked)}
                            />

                            <TerminalToggle
                                label="Callable"
                                checked={item.callable}
                                onChange={(checked) => handleUpdateField(index, "callable", checked)}
                            />
                        </div>
                    </div>
                </div>
            ))}

            <StateColumnOrderDialog
                isOpen={isOrderDialogOpen}
                onClose={() => setIsOrderDialogOpen(false)}
                columns={columns}
                onSave={handleOrderSave}
            />
        </div>
    );
}

export default StateColumns;