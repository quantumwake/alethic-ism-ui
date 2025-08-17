import {useStore} from "../../../store";
import React, { useEffect, useState } from "react";
import { PlusIcon, MinusIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { TerminalInput, TerminalToggle, TerminalButton} from "../../../components/common";
import {ChevronDownSquare, ChevronUpCircleIcon, ChevronUpSquare, MinusSquareIcon, SaveIcon} from "lucide-react";

function StateColumns({ nodeId }) {
    const theme = useStore(state => state.getCurrentTheme());
    const [columns, setColumns] = useState([]);
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

    const handleMoveColumn = (index, direction) => {
        const newColumns = [...columns];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        
        if (targetIndex < 0 || targetIndex >= newColumns.length) return;
        
        // Swap display_order values
        const tempOrder = newColumns[index].display_order || index;
        newColumns[index].display_order = newColumns[targetIndex].display_order || targetIndex;
        newColumns[targetIndex].display_order = tempOrder;
        
        // Swap array positions
        [newColumns[index], newColumns[targetIndex]] = [newColumns[targetIndex], newColumns[index]];
        
        setColumns(newColumns);
        setNodeDataColumns(nodeId, newColumns);
    };

    return (
        <div className={`${theme.spacing.base} flex flex-col space-y-4`}>
            {columns.map((item, index) => !item.deleted && (
                <div key={index} className={`flex flex-col space-y-2 p-2 border ${theme.border} border-opacity-50`}>
                    <div className="flex justify-between items-center">
                        <span className={`${theme.text} ${theme.font}`}>Column {index + 1}</span>
                        <div className="flex items-center space-x-1">
                            <TerminalButton className="border-0" variant="primary"
                                onClick={() => handleMoveColumn(index, 'up')}
                                disabled={index === 0}
                            ><ChevronUpSquare className="w-4 h-h"/></TerminalButton>
                            <TerminalButton className="border-0"
                                onClick={() => handleMoveColumn(index, 'down')}
                                disabled={index === columns.filter(c => !c.deleted).length - 1}
                            ><ChevronDownSquare className="w-4 h-h"/></TerminalButton>
                            <TerminalButton className="border-0"
                                // variant="danger"
                                // size="small"
                                onClick={() => handleRemoveField(index)}
                            ><MinusSquareIcon className="w-4 h-h"/></TerminalButton>
                        </div>
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

                        <TerminalInput
                            type="number"
                            value={item.display_order || ''}
                            onChange={(e) => handleUpdateField(index, "display_order", parseInt(e.target.value) || 0)}
                            placeholder="Display order"
                            label="Display Order"
                        />
                    </div>
                </div>
            ))}

            <TerminalButton
                variant="ghost"
                onClick={handleAddColumn}
                icon={<PlusIcon className="w-4 h-4" />}
            >
                Add Column
            </TerminalButton>
        </div>
    );
}

export default StateColumns;