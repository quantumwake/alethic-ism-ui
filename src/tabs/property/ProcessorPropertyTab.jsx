import {useStore} from '../../store';
import React, { useState, useEffect } from 'react';
import {TerminalDropdown, TerminalInput, TerminalLabel, TerminalTabViewSection} from "../../components/common";

const ProcessorPropertyTab = () => {
    const theme = useStore(state => state.getCurrentTheme());
    const {getNodeData, setNodeData} = useStore()
    const {getProvidersByClass, getProviderById: getProviderById, fetchProcessor} = useStore()

    const [selectedClass, setSelectedClass] = useState(null);
    const [isLoadingClass, setIsLoadingClass] = useState(false);
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

    // const [localNodeData, setLocalNodeData] = useState([])
    const {selectedNode} = useStore()
    const selectedNodeId = selectedNode?.id
    const nodeData = useStore(state => state.getNodeData(selectedNodeId))
    
    // Debug logging
    console.log('ProcessorPropertyTab render:', { selectedNode, selectedNodeId, selectedClass })

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

// Initialize class when fetching processor data
    useEffect(() => {
        if (!selectedNodeId) {
            setSelectedClass(null);
            setIsLoadingClass(false);
            return
        }

        setIsLoadingClass(true);
        fetchProcessor(selectedNodeId).then((data) => {
            const providerId = data.provider_id;
            const provider = getProviderById(providerId);
            const className = provider?.class_name || 'NaturalLanguageProcessing';

            // Only set the class - let the second useEffect handle provider filtering
            setSelectedClass(className);
            setIsLoadingClass(false);
        });
    }, [selectedNodeId]);

// Fix the useEffect for filtering providers
    useEffect(() => {
        if (!selectedClass) {
            return
        }

        console.debug(`filtering providers by class: ${selectedClass}`);
        const classProviders = getProvidersByClass(selectedClass);
        const classProvidersRemap = classProviders.map(t => ({ id: t.id, label: `${t.name} (${t.version})`}));
        console.debug(`filtered providers by class: ${selectedClass}, len: ${classProvidersRemap.length}`);

        setFilteredProviders(classProvidersRemap);

        // Reset provider selection if needed
        if (classProvidersRemap.length > 0) {
            const currentProviderId = nodeData?.provider_id;
            // Only reset if current provider isn't in the new list
            const providerExists = classProvidersRemap.some(p => p.id === currentProviderId);
            if (!providerExists && selectedNode?.id) {
                setNodeData(selectedNode.id, { provider_id: classProvidersRemap[0].id });
            }
        }
    }, [selectedClass]); // Remove setFilteredProviders from dependencies


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
                        key={`class-${selectedNodeId}`}  // Use selectedNodeId instead of selectedClass
                        values={filterClasses}
                        onSelect={(item) => setSelectedClass(item.id)}
                        defaultValue={selectedClass}
                        placeholder="runtime class">
                    </TerminalDropdown>

                    <TerminalLabel description="defines runtime provider for class">Runtime Provider</TerminalLabel>
                    <TerminalDropdown
                        key={`providers-${selectedClass}-${filteredProviders.length}`} // More robust key
                        values={filteredProviders}
                        onSelect={(item) => setNodeData(selectedNode.id, { provider_id: item.id })}
                        defaultValue={nodeData?.provider_id}
                        placeholder="provider">
                    </TerminalDropdown>

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