import {useStore} from '../../store';
import React, { useState, useEffect } from 'react';
import {TerminalDropdown, TerminalInput, TerminalLabel, TerminalTabViewSection} from "../../components/common";

const ProcessorPropertyTab = () => {
    const theme = useStore(state => state.getCurrentTheme());
    const {getNodeData, setNodeData} = useStore()
    const {getProviderByNameAndClass, providers, createProcessor, fetchProcessor} = useStore()
    const [filteredProviders, setFilteredProviders] = useState([]);
    // const [localNodeData, setLocalNodeData] = useState([])

    const {selectedNode} = useStore()
    const selectedNodeId = selectedNode?.id
    const nodeData = useStore(state => state.getNodeData(selectedNodeId))

    // holds property sections for specific processor type, generated on a section basis by processor details
    const [sections, setSections] = useState({})


    useEffect(() => {
        const internal = providers.map(t => ({ id: t.id, label: t.id }))

        // filteredProviders = getProviders()
        // const filteredProviders = getProviderByNameAndClass(providerName, className)
        setFilteredProviders(internal);

        const processorData = fetchProcessor(selectedNodeId)
            .then((data) => {
            console.log(`processor fetched ${data}`)
        })


    }, [selectedNode]);

    const update = () => {
        const state_type = nodeData?.state_type
        setSections(generateSections(state_type))
        console.debug(`configuration changed: updated sections ${state_type}`)
    }

    useEffect(() => {
        update()
    }, [nodeData])


    const generalBasic = (type) => {
        // all types have this
        return {
            title: "General",
            content: (
                <div className={`flex flex-col w-full space-y-4 ${theme.spacing.base}`}>
                    <TerminalLabel description="runtime execution">Runtime Provider</TerminalLabel>
                    <TerminalDropdown
                        values={filteredProviders}
                        onSelect={(data) =>  setNodeData(selectedNode.id, { provider_id: data.id })}
                        defaultValue={nodeData?.provider_id}
                        placeholder="Select provider type">
                    </TerminalDropdown>

                    <TerminalLabel description="runtime display name">Name</TerminalLabel>
                    <TerminalInput name="name" value={nodeData?.name || ''}
                        // onChange={handleChange}
                        placeholder="Enter processor name">
                    </TerminalInput>
                </div>
            )
        }
    }

    const generateSections = (type) => {
        return {
            general: {
                title: "General",
                items: {
                    basic: generalBasic(type),
                }
            },
            vault: {
                title: "Vault",
                items: {
                    config_map: <div>config map goes here</div>,
                    secrets: <div>secrets goes here</div>
                }
            },
        }
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

export default ProcessorPropertyTab;