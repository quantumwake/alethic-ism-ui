import React, {memo, useEffect} from "react";
import { Dialog, Transition } from "@headlessui/react";
import useStore from "./store";
import StateConfigDataKeyDefinitionHandler from "./StateConfigDataKeyDefinitionHandler";
import CustomListbox from "./CustomListbox";
import CustomInput from "./CustomInput";
import StateColumns from "./StateColumns";
import CustomSwitch from "./CustomSwitch";

const configOptions = [
    {config_type: 'StateConfig', config_name: 'Basic'},
    {config_type: 'StateConfigLM', config_name: 'Language'},
    {config_type: 'StateConfigDB', config_name: 'Database'},
    {config_type: 'StateConfigCode', config_name: 'Code'}
];

const codeOptions = [
    {config_type: 'python', config_name: 'python'},
    {config_type: 'rust', config_name: 'rust'},
    {config_type: 'golang', config_name: 'golang'},
];
function StateConfigDialog({ isOpen, setIsOpen, nodeId }) {

    const { templates } = useStore();
    const nodeData = useStore(state => state.getNodeData(nodeId))
    const setNodeData = useStore(state => state.setNodeData)
    const createState = useStore(state => state.createState)
    const fetchState = useStore(state => state.fetchState)

    // Extract the flags from the config
    const flags = Object.keys(nodeData?.config || {}).filter(key => key.startsWith('flag_'));

    // Fetch state object data if nodeId is provided
    useEffect(() => {
        (async () => {
            const stateData = await fetchState(nodeId)
            console.log(stateData)
        })();
    }, [fetchState, nodeId])

    const onChangeConfigFlag = (flag_name, value) => {
        nodeData.config[flag_name] = value
    }

    const onChangeDropDownSelection = (type, value) => {
        console.log(type + ' selected: ' + value);

        // eslint-disable-next-line default-case
        switch (type) {
            case "user_template":
                nodeData.config.user_template_id = value
                break
            case "system_template":
                nodeData.config.system_template_id = value
                break
            case "code_template":
                nodeData.config.template_id = value
                break
            case "code_language":
                nodeData.config.language = value
        }

        setNodeData(nodeId, nodeData)
    }

    const onConfigTypeChange = (state_type) => {
        setNodeData(nodeId, {
            state_type: state_type
        })
    };


    const onKeyDefinitionChanged = (definition_name, items) => {
        // nodeData.config[definition_name] = items
        // setNodeData(nodeId, nodeData)
    }

    const handleChange = (e) => {
        const value = e.target.value;
        switch (e.target.name) {
            case "name":
                nodeData.config.name = value
                break;
            case "language":
                nodeData.config.language = value
                break;
            default:
                break
        }

        setNodeData(nodeId, nodeData)
    }

    const handleDiscard = () => {
        setIsOpen(false);
    };

    const handleSave = async () => {
        const newState = await createState(nodeId)
        console.log('saved state: ' + newState)
        setIsOpen(false);
    }

    return (
        <Transition appear show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
                <Transition.Child
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={React.Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >

                            <Dialog.Panel
                                className="w-full max-w-screen-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                    State Config {nodeId}
                                </Dialog.Title>

                                <div className="mt-5 p-4 border-2 border-gray-200 rounded-lg shadow-sm">
                                    <table className="min-w-full divide-y divide-gray-300">
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            <tr>
                                                <td className="w-1/2 px-3 py-3">
                                                    <CustomListbox
                                                        option_value_key="config_type"
                                                        option_label_key="config_name"
                                                        options={configOptions}
                                                        onChange={onConfigTypeChange}
                                                        value={nodeData?.state_type}>
                                                    </CustomListbox>
                                                </td>

                                                <td className="w-1/2 px-3 py-3">
                                                    <CustomInput placeholder="State name" name="name"
                                                                 value={nodeData?.config?.name || ''} onChange={handleChange}/>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <table className="min-w-full divide-y divide-gray-300">
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {nodeData?.state_type === "StateConfigCode" && (
                                            <tr>
                                                <td className="px-3 py-3">
                                                    <CustomListbox
                                                        placeholder="Select language"
                                                        option_value_key="config_type"
                                                        option_label_key="config_name"
                                                        options={codeOptions}
                                                        onChange={(value) => onChangeDropDownSelection("code_language", value)}
                                                        value={nodeData?.config?.language}>
                                                    </CustomListbox>
                                                </td>

                                                <td className="px-3 py-3">
                                                    <CustomListbox
                                                        placeholder="Select code template"
                                                        option_value_key="template_id"
                                                        option_label_key="template_path"
                                                        options={templates}
                                                        onChange={(value) => onChangeDropDownSelection("code_template", value)}
                                                        value={nodeData?.config?.template_id}>
                                                    </CustomListbox>
                                                </td>
                                            </tr>

                                            )}

                                            {nodeData?.state_type === "StateConfigLM" && (
                                            <tr>
                                                <td className="px-3 py-3">
                                                    <CustomListbox
                                                        placeholder="Select code instruction"
                                                        option_value_key="template_id"
                                                        option_label_key="template_path"
                                                        options={templates}
                                                        onChange={(value) => onChangeDropDownSelection("user_template", value)}
                                                        value={nodeData?.config?.user_template_id}>
                                                    </CustomListbox>
                                                </td>

                                                <td className="px-3 py-3">
                                                    <CustomListbox
                                                        placeholder="Select system instruction template"
                                                        option_value_key="template_id"
                                                        option_label_key="template_path"
                                                        options={templates}
                                                        onChange={(value) => onChangeDropDownSelection("system_template", value)}
                                                        value={nodeData?.config?.system_template_id}>
                                                    </CustomListbox>
                                                </td>
                                            </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-5 p-4 border-2 border-gray-200 rounded-lg shadow-sm">
                                    <label>State flags</label>
                                    <p>
                                        Enable or disable state options
                                    </p>
                                    <table className="w-full border-collapse">
                                        <tbody>
                                        {flags.map((flag, index) => (
                                            <React.Fragment key={flag}>
                                                {index % 2 === 0 && <tr/>} {/* Start a new row for every two items */}
                                                <td className="px-3 py-3 border">
                                                    <div className="flex w-max flex-row items-center">
                                                        <div className="flex-1 w-1/2">
                                                            <label className="mr-4">{flag.replace('flag_', '').replace(/_/g, ' ')}</label>
                                                        </div>
                                                        <div className="flex-1 w-1/2">
                                                            <CustomSwitch
                                                                checked={nodeData?.config[flag]}
                                                                onChange={(checked) => onChangeConfigFlag(flag, checked)}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                            </React.Fragment>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-5 p-4 border-2 border-gray-200 rounded-lg shadow-sm">
                                    <label>
                                        Definition of Columns
                                    </label>

                                    <p>Columns within the state are dynamically defined during the processing of state
                                        output. Additionally, you can define columns that are not part of the state
                                        output, such as:
                                    </p>

                                    <ul>
                                        <li>
                                            <strong>Evaluated Columns:</strong> Columns whose values are calculated
                                            based on other data.
                                        </li>
                                        <li><strong>Constant Value Columns:</strong> Columns with fixed values.</li>
                                    </ul>

                                    <p>Key considerations:</p>
                                    <ul>
                                        <li>
                                            If a constant column overlaps with a processor-generated column, the
                                            processor's data will take precedence and overwrite the constant value.
                                        </li>
                                        <li>
                                            If a column is defined without a value, it is assumed that the value will be
                                            provided at the time of state data creation by the connected state output to
                                            the processor.
                                        </li>
                                    </ul>

                                    <div className="mt-2">
                                        <StateColumns nodeId={nodeId}/>
                                    </div>
                                </div>


                                <div className="mt-5 p-2 border-2 border-gray-100">
                                    <div className="mt-2">
                                        <label className="pr-2 font-medium">Definition of Primary Key Columns</label>
                                        <StateConfigDataKeyDefinitionHandler nodeId={nodeId}
                                                                             definition_name="primary_key"
                                                                             onStateChange={onKeyDefinitionChanged}/>
                                    </div>

                                    <div className="mt-2">
                                        <label className="pr-2 font-medium">Definition of Inherited Columns</label>
                                        <StateConfigDataKeyDefinitionHandler nodeId={nodeId}
                                                                             definition_name="query_state_inheritance"
                                                                             onStateChange={onKeyDefinitionChanged}/>
                                    </div>

                                    <div className="mt-2">
                                        <label className="pr-2 font-medium">Definition of Remap Query State Columns</label>
                                        <StateConfigDataKeyDefinitionHandler nodeId={nodeId}
                                                                             definition_name="remap_query_state_columns"
                                                                             onStateChange={onKeyDefinitionChanged}/>
                                    </div>

                                    <div className="mt-2">
                                        <label className="pr-2 font-medium">Definition of Template Keys</label>
                                        <StateConfigDataKeyDefinitionHandler nodeId={nodeId}
                                                                             definition_name="template_columns"
                                                                             onStateChange={onKeyDefinitionChanged}/>
                                    </div>

                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                                        onClick={handleDiscard}>
                                        Discard
                                    </button>

                                    <button
                                        type="button"
                                        className="ml-2 inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                        onClick={handleSave}>
                                        Save
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

export default memo(StateConfigDialog)
