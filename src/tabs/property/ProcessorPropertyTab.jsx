import {useStore} from '../../store';
import React, { useState, useEffect } from 'react';
import {TerminalDropdown, TerminalInput, TerminalLabel, TerminalTabViewSection} from "../../components/common";

const ProcessorPropertyTab = () => {
    const theme = useStore(state => state.getCurrentTheme());
    const {getNodeData, setNodeData} = useStore()
    const {getProvidersByClass, getProviderById: getProviderById, fetchProcessor} = useStore()
    const {selectedNodeId} = useStore()
    const nodeData = useStore(state => state.getNodeData(selectedNodeId))

    // Use class_name directly from nodeData (set by fetchProcessor)
    const selectedClass = nodeData?.class_name || null;
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
    const [isProvidersLoaded, setIsProvidersLoaded] = useState(false);
    
    // Debug logging
    console.log('ProcessorPropertyTab render:', { 
        selectedNodeId, 
        nodeData,
        providerId: nodeData?.provider_id,
        className: nodeData?.class_name,
        selectedClass,
        isProvidersLoaded 
    })

    // holds property sections for specific processor type, generated on a section basis by processor details
    const [sections, setSections] = useState({})

// Filter providers based on selected class
    useEffect(() => {
        if (!selectedClass) {
            setFilteredProviders([]);
            setIsProvidersLoaded(false);
            return
        }

        console.debug(`filtering providers by class: ${selectedClass}`);
        const classProviders = getProvidersByClass(selectedClass);
        const classProvidersRemap = classProviders.map(t => ({ id: t.id, label: `${t.name} (${t.version})`}));
        console.debug(`filtered providers by class: ${selectedClass}, len: ${classProvidersRemap.length}`);
        console.debug(`Current provider_id: ${nodeData?.provider_id}`);
        console.debug(`Available provider ids:`, classProvidersRemap.map(p => p.id));

        setFilteredProviders(classProvidersRemap);
        setIsProvidersLoaded(classProvidersRemap.length > 0);

        // Check if current provider is valid for the selected class
        if (nodeData?.provider_id && classProvidersRemap.length > 0) {
            const currentProviderId = nodeData.provider_id;
            const providerExists = classProvidersRemap.some(p => p.id === currentProviderId);

            if (!providerExists) {
                console.warn(`Current provider ${currentProviderId} not found in class ${selectedClass}`);
            }
        }
    }, [selectedClass, getProvidersByClass]); // Only re-run when class changes


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
                    <TerminalDropdown
                        key={`class-${selectedNodeId}-${nodeData?.provider_id}`}  // Use provider_id to force re-render when it changes
                        values={filterClasses}
                        onSelect={(item) => {
                            console.log('Class selected:', item.id);
                            // Only update provider if class actually changed
                            if (item.id !== selectedClass) {
                                const classProviders = getProvidersByClass(item.id);
                                console.log('Class changed, available providers:', classProviders);
                                if (classProviders.length > 0) {
                                    setNodeData(selectedNodeId, { 
                                        ...nodeData,
                                        provider_id: classProviders[0].id,
                                        class_name: item.id 
                                    });
                                }
                            }
                        }}
                        defaultValue={selectedClass}
                        placeholder="runtime class">
                    </TerminalDropdown>

                    <TerminalLabel description="defines runtime provider for class">Runtime Provider</TerminalLabel>
                    {isProvidersLoaded && filteredProviders.length > 0 ? (
                        <TerminalDropdown
                            key={`providers-${selectedClass}-${isProvidersLoaded}`}
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
                    ) : (
                        <div className={`${theme.text}`}>Loading providers...</div>
                    )}

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
    
    // Don't render until we have complete data from fetchProcessor
    if (!nodeData || !nodeData.provider_id || !nodeData.class_name) {
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