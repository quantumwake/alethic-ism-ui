import React, {useEffect, useState} from 'react';
import useStore from './store';
import {PlusIcon, BellAlertIcon} from "@heroicons/react/24/solid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Adjust the path as necessary
import {
    faCode,
    faCodeFork,
    faDiagramNext,
    faDiagramProject,
    faFileWaveform, faPlus,
    faProjectDiagram,
    faSync
} from '@fortawesome/free-solid-svg-icons'
import InstructionTemplateDialog from "./InstructionTemplateDialog";
import MonitorLogEventViewDialog from "./MonitorLogEventViewDialog";
import {CogIcon} from "@heroicons/react/24/outline";

function ProjectSelector() {
    const {userId} = useStore()
    const {projects, fetchProjects, addProject, selectedProjectId, setSelectedProjectId, fetchProjectProcessorStates} = useStore();
    const {fetchWorkflowNodes, fetchWorkflowEdges, fetchTemplates, fetchProviders} = useStore();
    const [showAddProject, setShowAddProject] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [isOpenInstructionTemplate, setIsOpenInstructionTemplate] = useState(false);
    const [isOpenMonitorLogEvent, setIsOpenMonitorLogEvent] = useState(false);

    useEffect(() => {
        fetchProjects(userId);
    }, [userId]); // Fetch projects when userId changes

    const onChange = (evt: any) => {
        const projectId = evt.target.value;
        fetchWorkflowNodes(projectId);
        fetchWorkflowEdges(projectId);
        fetchTemplates(projectId)
        fetchProviders()
        setSelectedProjectId(projectId)
        console.log('project selected: ' + projectId);
    };

    const refreshProcessorStates = () => {
        console.info('refreshing processor states store, this includes workflow node and edge status information')
        const projectStates = fetchProjectProcessorStates()

    }

    const handleAddProject = async () => {
        if (newProjectName.trim()) {
            const success = await addProject(userId, newProjectName);
            if (success) {
                setNewProjectName('');
                setShowAddProject(false);
            } else {
                console.error('Error adding project');
            }
        }
    };

    return (
        <div className="flex flex-col items-start">
            {/*Listing of projects and fetch from backend event*/}
            <div className="relative inline-flex">
                <select
                    className="border border-gray-300 text-gray-600 h-10 pl-5 pr-10 bg-white hover:border-gray-400 focus:outline-none appearance-none"
                    onChange={onChange}>
                    <option key="" value="">
                        Select project...
                    </option>
                    {projects.length > 0 && projects.map((project: any) => (
                        <option key={project.project_id} value={project.project_id}>
                            {project.project_name}
                        </option>
                    ))}
                </select>
                <button
                    onClick={() => setShowAddProject(!showAddProject)}
                    className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 font-sans px-4 rounded">
                    <FontAwesomeIcon icon={faDiagramNext}/>
                </button>
                <button
                    onClick={() => setIsOpenInstructionTemplate(true)}
                    className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold font-sans py-2 px-4 rounded">
                    <FontAwesomeIcon icon={faCode}/>
                </button>
                <div className="mr-2 ml-2"></div>
                <button
                    // onClick={() => setIsOpenInstructionTemplate(true)}
                    className="ml-2 bg-gray-400 hover:bg-blue-700 text-white font-bold font-sans py-2 px-4 rounded">
                    <FontAwesomeIcon icon={faCodeFork}/>
                </button>

                <button
                    onClick={() => refreshProcessorStates()}
                    className="ml-2 bg-stone-400 text-white hover:bg-blue-700 font-sans font-bold py-2 px-4 rounded">
                    <FontAwesomeIcon icon={faSync}/>
                </button>

                <button
                    onClick={() => setIsOpenMonitorLogEvent(true)}
                    className="ml-2 bg-red-200 hover:bg-red-700 text-white font-bold font-sans py-2 px-4 rounded">
                    <BellAlertIcon className="h-4 w-4 text-red-600 hover:text-white"/>
                </button>
            </div>

            {/*Manage of Instruction Templates (language, code, racketeer.. )*/}
            <InstructionTemplateDialog isOpen={isOpenInstructionTemplate} setIsOpen={setIsOpenInstructionTemplate}/>
            <MonitorLogEventViewDialog isOpen={isOpenMonitorLogEvent} setIsOpen={setIsOpenMonitorLogEvent} projectId={selectedProjectId}/>

            {/*Add new project name input and action*/}
            {showAddProject && (
                <div className="mt-2">
                    <input
                        type="text"
                        className="border border-gray-300 text-gray-600 h-10 pl-5 pr-10 bg-white hover:border-gray-400 focus:outline-none appearance-none"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="New Project Name"
                    />
                    <button
                        onClick={handleAddProject}
                        className="ml-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                        Submit
                    </button>
                </div>
            )}
        </div>
    );
}

const Topbar = () => {
    return (
        <div className="flex flex-col">
            <div className="w-full h-10 p-2 shadow-md drop-shadow-lg shadow-yellow-400 bg-black mb-0.5">
                <h1 className="flex-row flex"><FontAwesomeIcon icon={faDiagramProject} className="w-5 h-5 mr-2 mt-0.5"/>ISM Workflow Designer</h1>
            </div>
            <div className="w-full h-14 bg-stone-50 p-2 shadow-sm drop-shadow-lg shadow-red-200">
                <ProjectSelector/>
            </div>


        </div>
    );
};

export default Topbar;
