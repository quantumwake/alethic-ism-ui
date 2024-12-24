import React from "react";
import useStore from "../../../store";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import { TerminalInput, TerminalToggle, TerminalButton } from "../../../components/common";

function StateConfigDataKeyDefinition({ nodeId, definition_name, onStateChange }) {
    const theme = useStore(state => state.getCurrentTheme());
    const nodeData = useStore(state => state.getNodeData(nodeId));
    const setNodeData = useStore(state => state.setNodeData);
    const configItems = useStore(state =>
        state.getNodeDataStateConfigKeyDefinition(nodeId, definition_name)
    );
    const deleteNodeDataStateConfigKeyDefinition = useStore(
        state => state.deleteNodeDataStateConfigKeyDefinition
    );

    const handleAddField = () => {
        const prevItems = nodeData?.config[definition_name];
        const required = definition_name === "primary_key";
        const newItem = { name: "", alias: "", required, callable: false };

        nodeData.config[definition_name] = prevItems ? [...prevItems, newItem] : [newItem];
        setNodeData(nodeId, nodeData);
    };

    const handleUpdateField = (index, field, value) => {
        nodeData.config[definition_name][index][field] = value;
        setNodeData(nodeId, nodeData);
    };

    const handleRemoveField = async (index) => {
        const id = nodeData.config[definition_name][index]['id'];
        if (id) {
            await deleteNodeDataStateConfigKeyDefinition(nodeId, definition_name, id);
        }
        nodeData.config[definition_name].splice(index, 1);
        setNodeData(nodeId, nodeData);
    };

    return (
        <div className={`${theme.spacing.base} flex flex-col space-y-4`}>
            {configItems?.map((item, index) => (
                <div key={index} className="flex flex-col space-y-2 p-2 border border-opacity-50">
                    <div className="flex justify-between items-center">
                        <span className={`${theme.text} ${theme.font}`}>Definition {index + 1}</span>
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
                            placeholder="Key name"
                        />

                        <TerminalInput
                            value={item.alias}
                            onChange={(e) => handleUpdateField(index, "alias", e.target.value)}
                            placeholder="Key alias"
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
                onClick={handleAddField}
                icon={<PlusIcon className="w-4 h-4" />}
            >
                Add Definition
            </TerminalButton>
        </div>
    );
}

export default StateConfigDataKeyDefinition;