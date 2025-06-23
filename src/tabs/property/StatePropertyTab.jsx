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
    const {templates} = useStore();
    const [internalTemplates, setInternalTemplates] = useState([])

    useEffect(() => {
        const internal = templates.map(t => (
            { id: t.template_id, label: t.template_path }
        ))
        setInternalTemplates(internal)
    }, [templates]);


    const {selectedNodeId, setNodeData, fetchState, getNode, getNodeData} = useStore()
    const node = useStore(state => state.getNode(selectedNodeId))
    const nodeData = useStore(state => state.getNodeData(selectedNodeId))
    const [isAdvancedCollapsed, setIsAdvancedCollapsed] = useState(false);
    
    // Debug logging
    console.log('StatePropertyTab render:', { 
        selectedNodeId, 
        nodeData,
        stateType: nodeData?.state_type,
        userTemplateId: nodeData?.config?.user_template_id,
        systemTemplateId: nodeData?.config?.system_template_id,
        templateId: nodeData?.config?.template_id
    })

    // Extract the flags from the config
    const flags = Object.keys(nodeData?.config || {}).filter(key => key.startsWith('flag_'));

    // Fetch state object data if id is provided
    useEffect(() => {
        if (!selectedNodeId) {
            return;
        }

        (async () => {
            try {
                const stateData = await fetchState(selectedNodeId)
                console.log('State data loaded:', stateData)
            } catch (error) {
                console.error('Failed to fetch state:', error);
            }
        })();
    }, [fetchState, selectedNodeId])

    const onChangeConfigFlag = async (flag_name, value) => {
        console.log(flag_name, value)
        setNodeData(selectedNodeId, {
            ...nodeData,
            config: {
                ...(nodeData?.config || {}),
                [flag_name]: value
            }
        })
    }



    const onChangeDropDownSelection = (type, value) => {

        console.log(type + ' selected: ' + value);
        // eslint-disable-next-line default-case
        
        let updatedConfig = { ...(nodeData?.config || {}) };

        switch (type) {
            case "user_template":
                updatedConfig.user_template_id = value.id
                break
            case "system_template":
                updatedConfig.system_template_id = value.id
                break
            // general single template state configurations (e.g. stream, code, visual
            case "template":
                updatedConfig.template_id = value.id
                break
            case "filter":
                updatedConfig.filter_id = value.id
                break
        }
        setNodeData(selectedNodeId, {
            ...nodeData,
            config: updatedConfig
        })
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
        const fieldName = e.target.name;
        
        let updatedNodeData = { ...nodeData };
        let updatedConfig = { ...(nodeData?.config || {}) };

        switch (fieldName) {
            case "name":
                updatedConfig.name = value;
                // Also update the node label
                if (node) {
                    setNodeData(selectedNodeId, {
                        ...updatedNodeData,
                        label: value,
                        config: updatedConfig
                    });
                    return;
                }
                break;
            case "language":
                updatedConfig.language = value;
                break;
            case "width":
                updatedConfig.width = value;
                break;
            case "height":
                updatedConfig.height = value;
                break;
            default:
                return;
        }
        
        setNodeData(selectedNodeId, {
            ...updatedNodeData,
            config: updatedConfig
        });
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
                                key={`state-type-${selectedNodeId}-${nodeData?.state_type}`}
                                values={configOptions}
                                onSelect={(config_type) => {
                                    setNodeData(selectedNodeId, {
                                        ...nodeData,
                                        state_type: config_type.id
                                    });
                                }}
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
                        key={`template-${selectedNodeId}-${nodeData?.config?.template_id}`}
                        values={internalTemplates}
                        onSelect={(value) => onChangeDropDownSelection("template", value)}
                        defaultValue={nodeData?.config?.template_id}
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
                            key={`user-template-${selectedNodeId}-${nodeData?.config?.user_template_id}`}
                            allowEmpty={true}
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
                            key={`system-template-${selectedNodeId}-${nodeData?.config?.system_template_id}`}
                            allowEmpty={true}
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
            title: "Primary Keys",
            items: {
                title: "Primary Key",
                content: <StateConfigDataKeyDefinition
                    nodeId={selectedNodeId}
                    definition_name="primary_key"
                    onStateChange={onKeyDefinitionChanged}/>
            }
        }
    }

    const stateConfigJoinKeyColumns = (type) => {
        return {
            title: "Join Keys",
            items: {
                title: "Join Keys",
                content: <StateConfigDataKeyDefinition
                    nodeId={selectedNodeId}
                    definition_name="state_join_key"
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
                    state_join_key: {
                        title: "Join Keys",
                        content: <TerminalTabViewSection title="Join" items={stateConfigJoinKeyColumns(type)} sub={true} />
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

    // Don't render until we have at least the basic node data structure
    if (!nodeData || (!nodeData.state_type && !nodeData.id)) {
        return <div className={`${theme.text} ${theme.spacing.base}`}>Loading state data...</div>;
    }

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