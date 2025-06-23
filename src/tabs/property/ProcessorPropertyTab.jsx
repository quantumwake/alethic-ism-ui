import {useStore} from '../../store';
import React, { useState, useEffect } from 'react';
import {TerminalDropdown, TerminalInput, TerminalLabel, TerminalTabViewSection} from "../../components/common";

const ProcessorPropertyTab = () => {
    const theme = useStore(state => state.getCurrentTheme());
    const {getNodeData, setNodeData} = useStore()
    const {getProvidersByClass, getProviderById: getProviderById, fetchProcessor} = useStore()
    const {selectedNodeId} = useStore()
    const nodeData = useStore(state => state.getNodeData(selectedNodeId))

    // Derive selected class from current provider in nodeData
    const currentProvider = nodeData?.provider_id ? getProviderById(nodeData.provider_id) : null;
    const selectedClass = currentProvider?.class_name || null;
    const [filterClasses] = useState([
        {id: "AudioProcessing", label: "Audio Processing" },
        {id: "CodeProcessing", label: "Code Processing" },
        {id: "DataAnalysis", label: "Data Analysis" },
        {id: "DataTransformation", label: "Data Transformation" },
        {id: "DatabaseProcessing", label: "Database Processing" },
        {id: "ImageProcessing", label: "Image Processing" },
        {id: "Interaction", label: "Interaction" },
        {id: "MachineLearning", label: "Machine Learning" },
        {id: "NaturalLanguageProcessing", label: "Natural Language Processing" },
        {id: "SignalProcessing", label: "Signal Processing" },
        {id: "TextProcessing", label: "Text Processing" },
        {id: "VideoProcessing", label: "Video Processing" },
    ])

    const [filteredProviders, setFilteredProviders] = useState([]);
    
    // Debug logging
    console.log('ProcessorPropertyTab render:', { 
        selectedNodeId, 
        nodeData,
        providerId: nodeData?.provider_id,
        currentProvider,
        selectedClass 
    })

    // holds property sections for specific processor type, generated on a section basis by processor details
    const [sections, setSections] = useState({})

    // useEffect(() => {
    //     console.debug(`filtering providers by class: ${filteredClass}`)
    //     const classProviders = getProvidersByClass(filteredClass);
    //     const classProvidersRemap = classProviders.map(t => ({ id: t.id, label: t.id }));
    //     console.debug(`filtered providers by class: ${filteredClass}, len: ${classProvidersRemap.length}`)
    //     setFilteredProviders(classProvidersRemap);
    // }, [filteredClass, setFilteredProviders])
    //

    // Fetch processor data when node is selected
    useEffect(() => {
        if (!selectedNodeId) {
            return
        }

        console.log('Fetching processor data for node:', selectedNodeId);
        fetchProcessor(selectedNodeId).then((data) => {
            console.log('Fetched processor data:', data);
            // The data is automatically stored in nodeData via setNodeData in fetchProcessor
        }).catch((error) => {
            console.error('Failed to fetch processor:', error);
        });
    }, [selectedNodeId, fetchProcessor]);

// Filter providers based on selected class
    useEffect(() => {
        if (!selectedClass) {
            setFilteredProviders([]);
            return
        }

        console.debug(`filtering providers by class: ${selectedClass}`);
        const classProviders = getProvidersByClass(selectedClass);
        const classProvidersRemap = classProviders.map(t => ({ id: t.id, label: `${t.name} (${t.version})`}));
        console.debug(`filtered providers by class: ${selectedClass}, len: ${classProvidersRemap.length}`);

        setFilteredProviders(classProvidersRemap);

        // Check if current provider is valid for the selected class
        if (nodeData?.provider_id) {
            const currentProviderId = nodeData.provider_id;
            const providerExists = classProvidersRemap.some(p => p.id === currentProviderId);
            
            // If current provider doesn't match the class, this might be initial load
            // where fetchProcessor hasn't completed yet
            if (!providerExists) {
                console.warn(`Current provider ${currentProviderId} not found in class ${selectedClass}`);
            }
        }
    }, [selectedClass, nodeData?.provider_id]); // Include provider_id to re-check when it changes


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

                    <TerminalLabel description="defines class of runtimes">Runtime Class</TerminalLabel>
                    {isWaitingForProvider ? (
                        <div className={`${theme.text}`}>Loading class...</div>
                    ) : (
                        <TerminalDropdown
                            key={`class-${selectedNodeId}-${nodeData?.provider_id}`}  // Use provider_id to force re-render when it changes
                            values={filterClasses}
                            onSelect={(item) => {
                                console.log('Class selected:', item.id);
                                // When class changes, find first provider of that class
                                const classProviders = getProvidersByClass(item.id);
                                console.log('Available providers for class:', classProviders);
                                if (classProviders.length > 0) {
                                    setNodeData(selectedNodeId, { 
                                        ...nodeData,
                                        provider_id: classProviders[0].id 
                                    });
                                }
                            }}
                            defaultValue={selectedClass}
                            placeholder="runtime class">
                        </TerminalDropdown>
                    )}

                    <TerminalLabel description="defines runtime provider for class">Runtime Provider</TerminalLabel>
                    {isWaitingForProvider || !selectedClass ? (
                        <div className={`${theme.text}`}>Loading providers...</div>
                    ) : (
                        <TerminalDropdown
                            key={`providers-${selectedClass}-${nodeData?.provider_id}`}
                            values={filteredProviders}
                            onSelect={(item) => {
                                console.log('Provider selected:', item.id);
                                setNodeData(selectedNodeId, { 
                                    ...nodeData,
                                    provider_id: item.id 
                                });
                            }}
                            defaultValue={nodeData?.provider_id}
                            placeholder="provider">
                        </TerminalDropdown>
                    )}

                    <TerminalLabel description="runtime display name">Name</TerminalLabel>
                    <TerminalInput name="name" value={nodeData?.name || ''}
                        // onChange={handleChange}
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
    
    // Don't render until we have at least the basic node data structure
    if (!nodeData || !nodeData.id) {
        return <div className={`${theme.text} ${theme.spacing.base}`}>Loading processor data...</div>;
    }
    
    // If we have nodeData but no provider_id yet, show a loading state for the class
    const isWaitingForProvider = nodeData && !nodeData.provider_id;

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