import {useStore} from '../../store';
import React, { useState, useEffect } from 'react';
import {TerminalInput, TerminalLabel, TerminalTabViewSection, TerminalAutocomplete} from "../../components/common";
import ProcessorJoinConfig from "./processor/ProcessorJoinConfig";
import ProcessorStateTablesConfig from "./processor/ProcessorStateTablesConfig";

const ProcessorPropertyTab = () => {
    const theme = useStore(state => state.getCurrentTheme());
    const {setNodeData} = useStore()
    const {providers, getProviderById, fetchProviders, fetchProcessor} = useStore()
    const {selectedNodeId} = useStore()
    const nodeData = useStore(state => state.getNodeData(selectedNodeId))

    // Get all providers with formatted display
    const [allProviders, setAllProviders] = useState([]);
    const [providersLoading, setProvidersLoading] = useState(true);
    

    // holds property sections for specific processor type, generated on a section basis by processor details
    const [sections, setSections] = useState({})

    // Fetch processor data when a processor node is selected
    useEffect(() => {
        if (selectedNodeId && nodeData?.id) {
            fetchProcessor(selectedNodeId);
        }
    }, [selectedNodeId]);

    // Fetch providers when a processor node is selected
    useEffect(() => {
        if (selectedNodeId && nodeData) {
            // Only fetch if we don't already have providers
            if (!providers || providers.length === 0) {
                setProvidersLoading(true);
                fetchProviders().then(() => {
                    console.log('Providers fetched for processor node:', selectedNodeId);
                    setProvidersLoading(false);
                }).catch((error) => {
                    console.error('Failed to fetch providers:', error);
                    setProvidersLoading(false);
                });
            } else {
                setProvidersLoading(false);
            }
        }
    }, [selectedNodeId, nodeData?.id]);

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
                <div className={`flex flex-col w-full space-y-2 ${theme.spacing.base}`}>

                    <div className="mb-2">
                        <TerminalLabel description="search and select runtime provider">Runtime Provider</TerminalLabel>
                    </div>
                    {!providersLoading && (
                        <TerminalAutocomplete
                            key={`provider-autocomplete-${nodeData?.provider_id}`}
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
                    )}
                    {providersLoading && (
                        <div className={`w-full px-3 py-1 text-sm font-mono ${theme.input.primary} ${theme.font} border rounded-none opacity-50`}>
                            Loading providers...
                        </div>
                    )}

                    <div className="mt-4 mb-2">
                        <TerminalLabel description="runtime display name">Name</TerminalLabel>
                    </div>
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

    const generateSections = () => {
        const sections = {
            general: {
                title: "General",
                items: {
                    basic: generalBasic(),
                }
            },
        };

        // Add processor-specific configuration
        // Show join configuration if provider_id contains 'join'
        if (nodeData?.provider_id?.includes('join')) {
            sections.configuration = {
                title: "Join Configuration",
                items: {
                    joinConfig: {
                        title: "",
                        content: <ProcessorJoinConfig nodeId={selectedNodeId} />
                    }
                }
            };
        }
        
        // Show state tables configuration if provider_id contains 'state-tables'
        if (nodeData?.provider_id?.includes('state-tables')) {
            sections.stateTablesConfig = {
                title: "State Tables Configuration",
                items: {
                    stateTablesConfig: {
                        title: "",
                        content: <ProcessorStateTablesConfig nodeId={selectedNodeId} />
                    }
                }
            };
        }

        // Always add vault section
        sections.vault = {
            title: "Vault",
            items: {
                config_map: <div>config map goes here</div>,
                secrets: <div>secrets goes here</div>
            }
        };

        return sections;
    }
    
    // Don't render until we have complete data from fetchProcessor
    if (!nodeData || !nodeData.id) {
        return null;
    }

    return (
        <>
            {Object.entries(sections).map(([key, section]) => (
                <TerminalTabViewSection
                    key={key}
                    title={section.title}
                    items={section.items}
                />
            ))}
        </>
    );
};

export default ProcessorPropertyTab;