import {useStore} from '../../store';
import React, { useState, useEffect } from 'react';
import {TerminalInput, TerminalLabel, TerminalTabViewSection, TerminalAutocomplete} from "../../components/common";

const ProcessorPropertyTab = () => {
    const theme = useStore(state => state.getCurrentTheme());
    const {setNodeData} = useStore()
    const {providers, getProviderById} = useStore()
    const {selectedNodeId} = useStore()
    const nodeData = useStore(state => state.getNodeData(selectedNodeId))

    // Get all providers with formatted display
    const [allProviders, setAllProviders] = useState([]);
    
    // Debug logging
    console.log('ProcessorPropertyTab render:', { 
        selectedNodeId, 
        nodeData,
        providerId: nodeData?.provider_id,
        className: nodeData?.class_name
    })

    // holds property sections for specific processor type, generated on a section basis by processor details
    const [sections, setSections] = useState({})

    // Format providers for autocomplete
    useEffect(() => {
        if (providers && providers.length > 0) {
            const formattedProviders = providers.map(provider => ({
                ...provider,
                displayName: `${provider.name} (${provider.version}) - ${provider.class_name || 'Unknown Class'}`
            }));
            setAllProviders(formattedProviders);
        }
    }, [providers]);


    const update = () => {
        const state_type = nodeData?.state_type
        setSections(generateSections(state_type))
        console.debug(`configuration changed: updated sections ${state_type}`)
    }

    useEffect(() => {
        update()
    }, [nodeData])

    const generalBasic = () => {
        // all types have this
        return {
            title: "General",
            content: (
                <div className={`flex flex-col w-full space-y-4 ${theme.spacing.base}`}>

                    <TerminalLabel description="search and select runtime provider">Runtime Provider</TerminalLabel>
                    <TerminalAutocomplete
                        placeholder="Search providers by name or class..."
                        items={allProviders}
                        value={nodeData?.provider_id}
                        displayField="displayName"
                        valueField="id"
                        onSelect={(provider) => {
                            console.log('Provider selected:', provider);
                            setNodeData(selectedNodeId, { 
                                ...nodeData,
                                provider_id: provider.id,
                                class_name: provider.class_name
                            });
                        }}
                        filterFn={(items, searchTerm) => {
                            if (!searchTerm) return items;
                            const lowerSearch = searchTerm.toLowerCase();
                            return items.filter(provider => 
                                provider.name.toLowerCase().includes(lowerSearch) ||
                                provider.class_name?.toLowerCase().includes(lowerSearch) ||
                                provider.version?.toLowerCase().includes(lowerSearch)
                            );
                        }}
                    />

                    <TerminalLabel description="runtime display name">Name</TerminalLabel>
                    <TerminalInput 
                        name="name" 
                        value={nodeData?.name || ''}
                        onChange={(e) => {
                            setNodeData(selectedNodeId, { 
                                ...nodeData,
                                name: e.target.value 
                            });
                        }}
                        placeholder="runtime process name (optional)">
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
                    basic: generalBasic(),
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
    
    // Don't render until we have complete data from fetchProcessor
    if (!nodeData || !nodeData.id) {
        return null;
    }

    return (
        <>
            {Object.entries(sections).map(([index, section]) => (
                <TerminalTabViewSection
                    title={section.title}
                    items={section.items}
                />
            ))}
        </>
    );
};

export default ProcessorPropertyTab;