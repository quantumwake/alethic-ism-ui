import React, {memo, useEffect, useState} from "react";
import {TerminalDialog, TerminalButton, TerminalLabel, TerminalInput, TerminalCheckbox} from "../common";
import {useStore} from "../../store";

function TerminalProjectCloneDialog({ isOpen, setIsOpen, projectId }) {
    const theme = useStore(state => state.getCurrentTheme());
    const { fetchProject, cloneProject, userId } = useStore();
    
    const [originalProject, setOriginalProject] = useState(null);
    const [clonedProjectName, setClonedProjectName] = useState("");
    const [copyColumns, setCopyColumns] = useState(true);
    const [copyData, setCopyData] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (projectId && isOpen) {
            fetchProjectDetails().then(
                () => console.debug(`Fetched project details for cloning: ${projectId}`),
            );
        }
    }, [projectId, isOpen]);

    const fetchProjectDetails = async () => {
        if (!projectId) return;
        
        const project = await fetchProject(projectId);
        if (project) {
            setOriginalProject(project);
            setClonedProjectName(`${project.project_name} (Copy)`);
        }
    };

    const handleClone = async () => {
        if (!originalProject || !clonedProjectName.trim()) return;
        
        setIsLoading(true);
        const clonedProject = await cloneProject(
            projectId,
            userId,
            clonedProjectName,
            copyColumns,
            copyData
        );
        
        setIsLoading(false);
        
        if (clonedProject) {
            handleClose();
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        setOriginalProject(null);
        setClonedProjectName("");
        setCopyColumns(true);
        setCopyData(false);
        setIsLoading(false);
    };

    return (
        <TerminalDialog isOpen={isOpen} onClose={handleClose} title="CLONE PROJECT">
            <div className="space-y-4">
                <div>
                    <TerminalLabel>Original Project</TerminalLabel>
                    <TerminalInput 
                        disabled={true} 
                        value={originalProject?.project_name || ""}
                    />
                </div>
                
                <div>
                    <TerminalLabel>Clone Name</TerminalLabel>
                    <TerminalInput 
                        name="name"
                        value={clonedProjectName}
                        onChange={(e) => setClonedProjectName(e.target.value)}
                        placeholder="Enter cloned project name..."
                    />
                </div>
                
                <div className="space-y-2">
                    <TerminalCheckbox
                        checked={copyColumns}
                        onChange={(e) => setCopyColumns(e.target.checked)}
                        label="Copy columns"
                    />
                    <TerminalCheckbox
                        checked={copyData}
                        onChange={(e) => setCopyData(e.target.checked)}
                        label="Copy data"
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <TerminalButton 
                        variant="secondary" 
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </TerminalButton>
                    <TerminalButton 
                        variant="primary" 
                        onClick={handleClone}
                        disabled={isLoading || !clonedProjectName.trim()}
                    >
                        {isLoading ? "Cloning..." : "Clone"}
                    </TerminalButton>
                </div>
            </div>
        </TerminalDialog>
    );
}

export default memo(TerminalProjectCloneDialog);