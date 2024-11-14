import React, {useEffect, useState} from "react";
import { Dialog, Transition } from "@headlessui/react";
import useStore from "./store";
import CustomList from "./CustomList";

function ProjectDialog({ isOpen, setIsOpen,}) {
    const {userId, jwtToken} = useStore()
    const {
        projects,
        fetchProjects,
        setSelectedProjectId,
    } = useStore();

    const {fetchWorkflowNodes, fetchWorkflowEdges, fetchTemplates, fetchProviders} = useStore();

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
        <Transition appear show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
                <Transition.Child
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25"/>
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={React.Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-2/3 rounded-lg bg-stone-100 h-[500pt] p-3 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="-m-3 mb-4 p-4 text-2xl font-medium leading-6 bg-stone-300 text-stone-800 shadow-stone-950">
                                    Projects
                                </Dialog.Title>
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
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

export default ProjectDialog;
