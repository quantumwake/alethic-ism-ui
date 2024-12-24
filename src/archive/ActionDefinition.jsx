import {MinusIcon, PlusIcon, CheckIcon, CommandLineIcon} from "@heroicons/react/24/solid";
import {
     MinusCircleIcon, PlusCircleIcon

} from "@heroicons/react/24/outline";

import useStore from "../store";
import CustomInput from "./CustomInput";
import React, {useEffect} from "react";

function ActionDefinition({ nodeId }) {
    const nodeData = useStore(state => state.getNodeData(nodeId))
    const setNodeData = useStore(state => state.setNodeData)
    const actionItems = useStore(state => state.getNodeDataStateConfigActions(nodeId))
    const deleteNodeDataStateConfigKeyDefinition = useStore(state => state.deleteNodeDataStateConfigKeyDefinition)

    // useEffect(() => {
    //
    // })

    // Function to add a new configuration item
    const handleAddAction = (e) => {
        const prevItems = nodeData?.config["actions"]
        const newItem = { action: "", action_field: "", remote_url: "" }

        // if there is no previous item then create an empty array
        if (prevItems)
            nodeData.config["actions"] = [...prevItems, newItem]
        else
            nodeData.config["actions"] = [newItem]

        setNodeData(nodeId, nodeData)
    };

    // Function to update a configuration item
    const handleUpdateAction = (index, field, value) => {
        nodeData.config["actions"][index][field] = value
        setNodeData(nodeId, nodeData)
    };

    // Function to remove a configuration item
    const handleRemoveAction = (index) => {
        const id = nodeData.config["actions"][index]['id']
        deleteNodeDataStateConfigKeyDefinition(nodeId, "actions", id).then(() => {
            nodeData.config["actions"] = nodeData.config["actions"].slice(index,1)
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
                            Type
                        </th>
                        <th scope="col" className="px-3 py-3">
                            Field
                        </th>
                        <th scope="col" className="px-3 py-3">
                            Remote URL
                        </th>
                        <th scope="col" className="px-3 py-3">
                            <button
                                onClick={(e) => handleAddAction(e)}>
                                <PlusCircleIcon className="h-6 w-6"/>
                            </button>
                        </th>
                    </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                    {actionItems && actionItems.map((item, index) => (
                        <tr key={index}>
                            <td className="px-3 py-3">
                                <CustomInput value={item.action}
                                             onChange={(e) => handleUpdateAction(index, "action", e.target.value)}/>
                            </td>
                            <td className="px-3 py-3">
                                <CustomInput value={item.action_field}
                                             onChange={(e) => handleUpdateAction(index, "action_field", e.target.value)}/>
                            </td>
                            <td className="px-3 py-3">
                                <CustomInput value={item.action_field}
                                             onChange={(e) => handleUpdateAction(index, "remote_url", e.target.value)}/>
                            </td>
                            <td className="px-3 py-3">
                                <CustomInput value={item.filter_id}
                                             onChange={(e) => handleUpdateAction(index, "filter_id ", e.target.value)}/>
                            </td>
                            <td className="px-3 py-3">
                                <button
                                    onClick={() => handleRemoveAction(index)}
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

export default ActionDefinition;
