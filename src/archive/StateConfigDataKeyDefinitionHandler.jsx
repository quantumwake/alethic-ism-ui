import {MinusIcon, PlusIcon, CheckIcon, CommandLineIcon} from "@heroicons/react/24/solid";
import {
    CodeBracketSquareIcon, MinusCircleIcon, PlusCircleIcon

} from "@heroicons/react/24/outline";

import useStore from "../store";
import {Switch} from "@headlessui/react";
import CustomSwitch from "./CustomSwitch";
import CustomInput from "./CustomInput";
import React from "react";

function StateConfigDataKeyDefinitionHandler({ nodeId, definition_name, onStateChange }) {
    const nodeData = useStore(state => state.getNodeData(nodeId))
    const setNodeData = useStore(state => state.setNodeData)
    const configItems = useStore(state => state.getNodeDataStateConfigKeyDefinition(nodeId, definition_name))
    const deleteNodeDataStateConfigKeyDefinition = useStore(state => state.deleteNodeDataStateConfigKeyDefinition)

    // Function to add a new configuration item
    const handleAddField = (e) => {
        const prevItems = nodeData?.config[definition_name]
        const required = definition_name === "primary_key"
        const newItem = { name: "", alias: "", required: required }

        // if there is no previous item then create an empty array
        if (prevItems)
            nodeData.config[definition_name] = [...prevItems, newItem]
        else
            nodeData.config[definition_name] = [newItem]

        setNodeData(nodeId, nodeData)
    };

    // Function to update a configuration item
    const handleUpdateField = (index, field, value) => {
        nodeData.config[definition_name][index][field] = value
        setNodeData(nodeId, nodeData)
    };

    // Function to remove a configuration item
    const handleRemoveField = (index) => {
        const id = nodeData.config[definition_name][index]['id']
        deleteNodeDataStateConfigKeyDefinition(nodeId, definition_name, id).then(() => {
            nodeData.config[definition_name] = nodeData.config[definition_name].slice(index,1)
            setNodeData(nodeId, nodeData)
        })
    };

    return (
        <div>
            {/* Repeat this structure for each of the four properties */}
            <div>

                <table className="border-2 rounded-lg min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-100">
                    <tr className="text-left text-xs font-medium text-gray-900 uppercase">
                        <th scope="col" className="px-3 py-3">
                            Name
                        </th>
                        <th scope="col" className="px-3 py-3">
                            Alias
                        </th>
                        <th scope="col" className="px-3 py-3">
                            <CheckIcon className="h-4 w-4"/>
                        </th>
                        <th scope="col" className="px-3 py-3">
                            <CodeBracketSquareIcon className="h-4 w-4"/>
                        </th>
                        <th scope="col" className="px-3 py-3">
                            <button
                                onClick={(e) => handleAddField(e)}>
                                <PlusCircleIcon className="h-6 w-6"/>
                            </button>
                        </th>
                    </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                    {configItems && configItems.map((item, index) => (
                        <tr key={index}>
                            <td className="px-3 py-3">
                                <CustomInput value={item.name}
                                             onChange={(e) => handleUpdateField(index, "name", e.target.value)}/>
                            </td>
                            <td className="px-3 py-3">
                                <CustomInput value={item.alias}
                                             onChange={(e) => handleUpdateField(index, "alias", e.target.value)}/>
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
                    ))}
                    </tbody>
                </table>

            </div>
        </div>
    );
}

export default StateConfigDataKeyDefinitionHandler;
