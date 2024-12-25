import {useStore} from "../../../store";
import React, { useEffect, useState } from "react";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import { TerminalInput, TerminalToggle, TerminalButton} from "../../../components/common";

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
        const newColumn = {
            id: null,
            name: "",
            value: "",
            callable: false,
            required: false
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

    return (
        <div className={`${theme.spacing.base} flex flex-col space-y-4`}>
            {columns.map((item, index) => !item.deleted && (
                <div key={index} className={`flex flex-col space-y-2 p-2 border ${theme.border} border-opacity-50`}>
                    <div className="flex justify-between items-center">
                        <span className={`${theme.text} ${theme.font}`}>Column {index + 1}</span>
                        <TerminalButton
                            variant="danger"
                            size="small"
                            onClick={() => handleRemoveField(index)}
                            icon={<MinusIcon className="w-4 h-4" />}
                        />
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