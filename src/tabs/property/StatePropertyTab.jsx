import React, { useState, useEffect } from 'react';
import {useStore} from '../../store';
import {
    TerminalInput,
    TerminalLabel,
    TerminalDropdown,
    TerminalToggle,
    TerminalTabViewSection,
} from '../../components/common'

import StateColumns from "./state/StateColumns";
import StateConfigDataKeyDefinition from "./state/StateConfigDataKeyDefinition";

const configOptions = [
    {id: 'StateConfig', label: 'Basic'},
    {id: 'StateConfigLM', label: 'Language'},
    {id: 'StateConfigDB', label: 'Database'},
    {id: 'StateConfigVisual', label: 'Visual'},
    {id: 'StateConfigCode', label: 'Code'},
    {id: 'StateConfigStream', label: 'Stream'},
    {id: 'StateConfigAudio', label: 'Audio'},
    {id: 'StateConfigUserInput', label: 'Interactive'},
];

const StatePropertyTab = () => {

    const theme = useStore(state => state.getCurrentTheme());
    const { templates } = useStore();
    const [internalTemplates, setInternalTemplates] = useState({})

    useEffect(() => {
        const internal = templates.map(t => ({ id: t.template_id, label: t.template_path }))
        setInternalTemplates(internal)
    }, [templates]);


    const {selectedNode, setNodeData, fetchState} = useStore()
    const selectedNodeId = selectedNode?.id
    const nodeData = useStore(state => state.getNodeData(selectedNodeId))
    const [isAdvancedCollapsed, setIsAdvancedCollapsed] = useState(false);

    // Extract the flags from the config
    const flags = Object.keys(nodeData?.config || {}).filter(key => key.startsWith('flag_'));

    // Fetch state object data if id is provided
    useEffect(() => {
        (async () => {
            const stateData = await fetchState(selectedNodeId)
            console.log(stateData)
        })();
    }, [fetchState, selectedNodeId])

    const onChangeConfigFlag = async (flag_name, value) => {
        console.log(flag_name, value)
        nodeData.config[flag_name] = value
        update()
    }



    const onChangeDropDownSelection = (type, value) => {

        console.log(type + ' selected: ' + value);
        // eslint-disable-next-line default-case

        switch (type) {
            case "user_template":
                nodeData.config.user_template_id = value.id
                break
            case "system_template":
                nodeData.config.system_template_id = value.id
                break
            // general single template state configurations (e.g. stream, code, visual
            case "template":
                nodeData.config.template_id = value.id
                break
            case "filter":
                nodeData.config.filter_id = value.id
                break
        }
        setNodeData(selectedNodeId, nodeData)

    }

    const onConfigTypeChange = (state_type) => {
        setNodeData(selectedNodeId, {
            state_type: state_type
        })


    };

    const onKeyDefinitionChanged = (definition_name, items) => {
        // nodeData.config[definition_name] = items
        // setNodeData(id, nodeData)

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
            case "width":
                nodeData.config.width = value
                break;
            case "height":
                nodeData.config.height = value
                break;
            default:
                break
        }
        setNodeData(selectedNodeId, nodeData)

    }

    const generalBasic = (type) => {
        // all types have this
        return {
            title: "General",
            content: (
                <div className={theme.spacing.base}>
                    <div className="flex flex-col space-y-4">
                        <div className="flex flex-col space-y-2">
                            <TerminalLabel description="Select the type of state">
                                State Type
                            </TerminalLabel>
                            <TerminalDropdown
                                values={configOptions}
                                onSelect={(config_type) => setNodeData(selectedNodeId, {state_type: config_type.id})}
                                defaultValue={nodeData?.state_type}
                                placeholder="Select State Type"
                            />
                        </div>

                        <div className="flex flex-col space-y-2">
                            <TerminalLabel description="display name for this state">
                                State Name
                            </TerminalLabel>
                            <TerminalInput
                                name="name"
                                value={nodeData?.config?.name || ''}
                                onChange={handleChange}
                                placeholder="Enter state name"
                            />
                        </div>
                    </div>
                </div>
            )
        }
    }

    const generalFlags = (type => {
        // Flags Section
        if (flags.length === 0) {
            return <></>
        }

        return {
            title: "Flags",
            content: (
                <div className={theme.spacing.base}>
                    <TerminalLabel description="available type of state flags">
                        State Flags
                    </TerminalLabel>
                    {flags.map(flag => (
                        <div key={flag} className={`flex items-center ${theme.spacing.sm}`}>
                            <span className={theme.text}>
                                {flag.replace('flag_', '').replace(/_/g, ' ')}
                            </span>
                            <TerminalToggle
                                checked={nodeData?.config[flag]}
                                onChange={(checked) => onChangeConfigFlag(flag, checked)}
                            />
                        </div>
                    ))}
                </div>
            )
        }
    })

    const functionTemplate = (type) => {
        if (![  "StateConfigStream",
                "StateConfigCode",
                "StateConfigVisual",
                "StateConfigAudio",
                "StateConfigUserInput",
                "StateConfigDB"].includes(type))
            return <></>

        return {
            title: "Instruction",
            content: (
                <div className={theme.spacing.base}>
                    <TerminalDropdown
                        values={internalTemplates}
                        onSelect={(value) => onChangeDropDownSelection("template", value)}
                        placeholder="Select function instruction"
                    />
                    {nodeData?.state_type === "StateConfigVisual" && (
                        <div className={theme.spacing.sm}>
                            <TerminalInput
                                name="width"
                                value={nodeData?.config?.width || ''}
                                onChange={handleChange}
                                placeholder="Width"
                            />
                            <TerminalInput
                                name="height"
                                value={nodeData?.config?.height || ''}
                                onChange={handleChange}
                                placeholder="Height"
                            />
                        </div>
                    )}
                </div>
            )
        }
    }

    const sectionLanguage = (type) => {
        if (type !== "StateConfigLM") return <></>
        return {
            title: "Instruction",
            content: (
                <div className={theme.spacing.base}>
                    <div className="flex flex-col gap-2">
                        <TerminalLabel description="Select a template for user interactions">
                            User Template
                        </TerminalLabel>
                        <TerminalDropdown
                            values={templates.map(t => ({id: t.template_id, label: t.template_path}))}
                            onSelect={(value) => onChangeDropDownSelection("user_template", value)}
                            defaultValue={nodeData?.config?.user_template_id}
                            placeholder="Select user template"
                        />
                    </div>

                    <div className="flex flex-col gap-2 py-2">
                        <TerminalLabel description="Select a template for system responses">
                            System Template
                        </TerminalLabel>
                        <TerminalDropdown
                            values={templates.map(t => ({id: t.template_id, label: t.template_path}))}
                            onSelect={(value) => onChangeDropDownSelection("system_template", value)}
                            defaultValue={nodeData?.config?.system_template_id}
                            placeholder="Select system template"
                        />
                    </div>
                </div>
            )
        }
    }

    const stateColumns = (type) => {
        // return <div>Hello World</div>
        return {
            title: "Columns",
            items: {
                title: "Columns",
                content: <StateColumns nodeId={selectedNodeId}/>
            }
        }
    }

    const stateConfigPrimaryKeyColumns = (type) => {
        return {
            title: "Primary Key",
            items: {
                title: "Primary Key",
                content: <StateConfigDataKeyDefinition
                    nodeId={selectedNodeId}
                    definition_name="primary_key"
                    onStateChange={onKeyDefinitionChanged}/>
            }
        }
    }

    const stateConfigRemappedColumns = (type) => {
        return {
            title: "Remapped Columns",
            items: {
                title: "Remapped Columns",
                content: <StateConfigDataKeyDefinition
                    nodeId={selectedNodeId}
                    definition_name="query_state_inheritance"
                    onStateChange={onKeyDefinitionChanged}/>
            }
        }
    }

    const stateConfigInheritedColumns = (type) => {
        return {
            title: "Inherited",
            items: {
                title: "Inherited",
                content: <StateConfigDataKeyDefinition
                    nodeId={selectedNodeId}
                    definition_name="query_state_inheritance"
                    onStateChange={onKeyDefinitionChanged}/>
            }
        }
    }

    const stateConfigTemplatedColumns = (type) => {
        return {
            title: "Template Columns",
            items: {
                title: "Template Columns",
                content: <StateConfigDataKeyDefinition
                    nodeId={selectedNodeId}
                    definition_name="template_columns"
                    onStateChange={onKeyDefinitionChanged}/>
            }
        }
    }

    const generateSections = (type) => {
        return {
            general: {
                title: "General",
                items: {
                    basic: generalBasic(type),
                    flags: generalFlags(type)
                }
            },
            function: {
                title: "Function",
                items: {
                    instruction: functionTemplate(type),
                    language: sectionLanguage(type)
                }
            },
            schema: {
                title: "Schema",
                items: {
                    primary_key: {
                        title: "Primary Key",
                        content: <TerminalTabViewSection title="Key" items={stateConfigPrimaryKeyColumns(type)} sub={true} />
                    },
                    columns: {
                        title: "Columns",
                        content: <TerminalTabViewSection title="Columns" items={stateColumns(type)} sub={true} />
                    },
                    inherited_columns: {
                        title: "",
                        content: <TerminalTabViewSection title="Inherited" items={stateConfigInheritedColumns(type)} sub={true} />
                    },
                    remapped_columns: {
                        title: "",
                        content: <TerminalTabViewSection title="Remapped" items={stateConfigRemappedColumns(type)} sub={true} />
                    },
                    templated_columns: {
                        title: "",
                        content: <TerminalTabViewSection title="Templated" items={stateConfigTemplatedColumns(type)} sub={true} />
                    }
                    // columns: <TerminalTabViewSection title="Columns" items={stateColumns(type)} />,
                    // primary_key: <TerminalTabViewSection title="Primary Key" items={stateConfigPrimaryKey(type)} />
                }
            }
        }
    }

    const [sections, setSections] = useState({})

    const update = () => {
        const state_type = nodeData?.state_type
        setSections(generateSections(state_type))
        console.debug(`configuration changed: updated sections ${state_type}`)
    }

    useEffect(() => {
        update()
    }, [nodeData])


    return (
        <>
            {Object.entries(sections).map(([index, section]) => (
                // <>asd</>
                <TerminalTabViewSection
                    title={section.title}
                    items={section.items}
                />
            ))}
        </>
    );
};

export default StatePropertyTab;