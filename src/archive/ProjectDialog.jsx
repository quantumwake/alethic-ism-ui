import React, {useEffect, useState} from "react";
import useStore from "../store";
import CustomList from "./CustomList";
import Dialog from "../standard/Dialog";

function ProjectDialog({ isOpen, setIsOpen,}) {
    const {userId, jwtToken} = useStore()
    const {
        projects,
        fetchProjects,
        setSelectedProjectId,
    } = useStore();

    const {fetchWorkflowNodes, fetchWorkflowEdges, fetchTemplates, fetchProviders} = useStore();
    const theme = useStore(state => state.getCurrentTheme());

    useEffect(() => {
        if (!jwtToken) {
            return
        }
        fetchProjects(userId).then(r => {});
        // refreshUsage()
    }, [jwtToken]); // Fetch projects when userId changes

    const projectSearch = (project, term) => {
        // This is just an example. Adjust according to your data structure and search requirements
        return project['project_name'].toLowerCase().includes(term.toLowerCase());
    };

    const handleDiscard = () => {
        // Implement discard functionality here
        setIsOpen(false);
    };

    const onSelectProject = async (project) => {
        const projectId = project['project_id']
        await fetchWorkflowNodes(projectId);
        await fetchWorkflowEdges(projectId);
        await fetchTemplates(projectId)
        await fetchProviders()
        setSelectedProjectId(projectId)
        console.log('project selected: ' + projectId);
        setIsOpen(false)
    }

    const renderProjectItem = (value) => <>
        <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
                <span className="inline-block h-10 w-10 rounded-full bg-blue-500"></span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                    {/*onClick={onSelectProject(value['project_id'])}*/}
                    <span className="font-bold">{value['project_name']}</span>
                </p>
                <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                    {/*onClick={onSelectProject(value['project_id'])}*/}
                    {value['created_date'].substring(0,10)} {value['created_date'].substring(11,19)}
                </p>
            </div>
        </div>
    </>

    return (
    <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Settings"
        width="500px"
        initialPosition={{ x: 100, y: 100 }}>

        <div className="flex h-[400pt] flex-col ring-stone-300">
            <CustomList
                values={projects}
                numOfColumns={3}
                renderItem={renderProjectItem}
                onItemClick={onSelectProject}
                searchFunction={projectSearch}
            />
        </div>

        <div className="mt-4 flex justify-end">
            <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                onClick={handleDiscard}>
                Close
            </button>
        </div>

    </Dialog>)
}

export default ProjectDialog;
