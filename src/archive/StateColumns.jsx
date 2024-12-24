import {MinusIcon, PlusIcon, CheckIcon, CommandLineIcon} from "@heroicons/react/24/solid";
import {
    CodeBracketSquareIcon, MinusCircleIcon, PlusCircleIcon

} from "@heroicons/react/24/outline";

import useStore from "../store";
import {Switch} from "@headlessui/react";
import CustomSwitch from "./CustomSwitch";
import CustomInput from "./CustomInput";
import React, {useEffect, useState} from "react";

function StateColumns({ nodeId }) {

    const [columns, setColumns] = useState([])
    const getNodeDataColumns = useStore(state => state.getNodeDataColumns)
    const setNodeDataColumns = useStore(state => state.setNodeDataColumns)

    useEffect(() => {
        (async () => {
            const stateColumns = getNodeDataColumns(nodeId)
            setColumns(stateColumns)
        })();
    }, [nodeId])


    // Function to add a new configuration item
    const handleAddColumn = (e) => {
        const newColumn = {
            id: null,
            name: "",
            value: "",
            callable: false,
            required: false
        }

        const newColumns = [...columns, newColumn]
        setColumns(newColumns)
        setNodeDataColumns(nodeId, newColumns)
    }

    // Function to update a configuration item
    const handleUpdateField = (index, field, value) => {
        const newColumns = [...columns];
        newColumns[index] = {
            ...newColumns[index],
            [field]: value
        };
        setColumns(newColumns);
        setNodeDataColumns(nodeId, newColumns);
    };

    // Function to remove a configuration item
    const handleRemoveField = (index) => {
        const id = columns[index].id
        if (id) {
            columns[index].deleted = true
            setColumns(columns)
        } else {
            columns.splice(index, 1)
            setColumns(columns)
        }

        setNodeDataColumns(nodeId, columns);
        // setNodeDataColumns(nodeId, columns)
    };

    return (
        <table className="border-2 rounded-lg min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-100">
            <tr className="text-left text-xs font-medium text-gray-900 uppercase">
                <th scope="col" className="px-3 py-3">
                    Name
                </th>

                <th scope="col" className="px-3 py-3">
                    Value
                </th>

                <th scope="col" className="px-3 py-3">
                    <CheckIcon className="h-4 w-4"/>
                </th>

                <th scope="col" className="px-3 py-3">
                    <CodeBracketSquareIcon className="h-4 w-4"/>
                </th>

                <th scope="col" className="px-3 py-3">
                    <button
                        onClick={(e) => handleAddColumn(e)}>
                        <PlusCircleIcon className="h-6 w-6"/>
                    </button>
                </th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">

            {columns.map((item, index) => (!item.deleted ? (
                <tr key={index}>
                <td className="px-3 py-3">
                    <CustomInput value={item.name} onChange={(e) => handleUpdateField(index, "name", e.target.value)}/>
                    </td>
                    <td className="px-3 py-3">
                        <CustomInput value={item.value} onChange={(e) => handleUpdateField(index, "value", e.target.value)}/>
                    </td>
                    <td className="px-3 py-3">
                        <CustomSwitch
                            checked={item.required}
                            onChange={(e) => handleUpdateField(index, "required", e)}>
                        </CustomSwitch>
                    </td>
                    <td className="px-3 py-3">
                        <CustomSwitch
                            checked={item.callable}
                            onChange={(e) => handleUpdateField(index, "callable", e)}>
                        </CustomSwitch>
                    </td>
                    <td className="px-3 py-3">
                        <button
                            onClick={() => handleRemoveField(index)}
                            className="text-red-600 hover:bg-amber-600 hover:text-red-900">
                            <MinusCircleIcon className="h-6 w-6"/>
                        </button>
                    </td>
                </tr>
                ) : null)
            )}
            </tbody>
        </table>
    );
}

export default StateColumns;