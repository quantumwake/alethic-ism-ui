import React, {useEffect, useState} from 'react';
import useStore from './store';
import {PlusIcon, BellAlertIcon} from "@heroicons/react/24/solid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Adjust the path as necessary

import {
    MenubarMenu,
    MenubarTrigger,
    MenubarContent,
    MenubarItem,
    MenubarSeparator,
    MenubarShortcut,
    Menubar,
} from "@/components/ui/menubar"

import {
    faBoxOpen,
    faCodeBranch,
    faDiagramProject, faFileCode, faFolderOpen,
    faPlusCircle, faPlusSquare, faProjectDiagram,
    faSyncAlt, faWarning
} from '@fortawesome/free-solid-svg-icons'

import InstructionTemplateDialog from "./InstructionTemplateDialog";
import MonitorLogEventViewDialog from "./MonitorLogEventViewDialog";
import UsageReportDialog from "./UsageCharts";
import NewProjectDialog from "./NewProjectDialog";

function OtherMenuItems() {
    const [isOpenInstructionTemplate, setIsOpenInstructionTemplate] = useState(false);
    const [isOpenMonitorLogEvent, setIsOpenMonitorLogEvent] = useState(false);
    const [isOpenUsageReportDialog, setIsOpenUsageReportDialog] = useState(false);

    const {jwtToken} = useStore()
    const {userUsageReport, fetchProjectProcessorStates, fetchUsageReportGroupByUser} = useStore()

    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isUsageRefreshing, setIsUsageRefreshing] = useState(true)

    let timeoutId: string | number | NodeJS.Timeout | undefined
    let usageTimeoutId: string | number | NodeJS.Timeout | undefined

    const refreshProcessorStates = () => {
        if (isRefreshing) {
            console.info('refreshing processor states store, this includes workflow node and edge status information')
            fetchProjectProcessorStates()
            timeoutId = setTimeout(refreshProcessorStates, 1000);
        } else if (timeoutId) {
            clearTimeout(timeoutId)
        }
    }

    const refreshUsage = () => {
        if (isUsageRefreshing) {
            console.info('refreshing processor states store, this includes workflow node and edge status information')
            fetchUsageReportGroupByUser()
            usageTimeoutId = setTimeout(refreshUsage, 10000);
        } else if (usageTimeoutId) {
            clearTimeout(usageTimeoutId)
        }
    }

    useEffect(() => {
        if (isRefreshing) {
            refreshProcessorStates()
        }
    }, [isRefreshing, setIsRefreshing]);


    useEffect(() => {
        if (!jwtToken) {
            return
        }
        refreshUsage()
    }, [jwtToken]); // Fetch projects when userId changes


    const toggleIsRefreshing = () => {
        setIsRefreshing(prev => !prev);
    }

    return (<>

        {/*/!* Open Instruction Template Button *!/*/}
        {/*<button*/}
        {/*    onClick={() => setIsOpenInstructionTemplate(true)}*/}
        {/*    className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded">*/}
        {/*    <FontAwesomeIcon icon={faFileCode}/>*/}
        {/*</button>*/}

        {/*/!* Fork Code Button *!/*/}
        {/*<button*/}
        {/*    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">*/}
        {/*    <FontAwesomeIcon icon={faCodeBranch}/>*/}
        {/*</button>*/}

        {/*/!* Refresh Button *!/*/}
        {/*/!*<button*!/*/}
        {/*/!*    onClick={() => toggleIsRefreshing()}*!/*/}
        {/*/!*    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">*!/*/}
        {/*/!*    <FontAwesomeIcon icon={faSyncAlt}/>*!/*/}
        {/*/!*</button>*!/*/}
        {/*<button*/}
        {/*    onClick={toggleIsRefreshing}*/}
        {/*    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">*/}
        {/*    <FontAwesomeIcon*/}
        {/*        icon={faSyncAlt}*/}
        {/*        className={isRefreshing ? 'animate-[spin_3s_linear_infinite]' : ''}*/}
        {/*    />*/}
        {/*</button>*/}

        {/*/!* Monitor Log Event Button *!/*/}
        {/*<button*/}
        {/*    onClick={() => setIsOpenMonitorLogEvent(true)}*/}
        {/*    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">*/}
        {/*    <FontAwesomeIcon icon={faWarning}/>*/}
        {/*</button>*/}

            <div>Usage: {userUsageReport?.total || 0}</div>
            {/*<button*/}
            {/*    onClick={() => setIsOpenUsageReportDialog(true)}*/}
            {/*    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">*/}
            {/*    <FontAwesomeIcon icon={faBlog}/>*/}
            {/*</button>*/}
    </>)
}

function ProjectSelector() {
    const {userId, jwtToken} = useStore()
    const {
        projects,
        fetchProjects,
        // selectedProjectId,
        setSelectedProjectId,
    } = useStore();

    const {fetchWorkflowNodes, fetchWorkflowEdges, fetchTemplates, fetchProviders} = useStore();
    const [isOpenNewProjectDialog, setIsOpenNewProjectDialog] = useState(false);
    //
    // const [isRefreshing, setIsRefreshing] = useState(false)
    // const [isUsageRefreshing, setIsUsageRefreshing] = useState(true)
    //
    // let timeoutId: string | number | NodeJS.Timeout | undefined
    // let usageTimeoutId: string | number | NodeJS.Timeout | undefined

    // const refreshUsage = () => {
    //     if (isUsageRefreshing) {
    //         console.info('refreshing processor states store, this includes workflow node and edge status information')
    //         fetchUsageReportGroupByUser()
    //         usageTimeoutId = setTimeout(refreshUsage, 10000);
    //     } else if (usageTimeoutId) {
    //         clearTimeout(usageTimeoutId)
    //     }
    // }
    //

    useEffect(() => {
        if (!jwtToken) {
            return
        }
        fetchProjects(userId);
        // refreshUsage()
    }, [jwtToken]); // Fetch projects when userId changes

    const onChange = (evt: any) => {
        const projectId = evt.target.value;
        fetchWorkflowNodes(projectId);
        fetchWorkflowEdges(projectId);
        fetchTemplates(projectId)
        fetchProviders()
        setSelectedProjectId(projectId)
        console.log('project selected: ' + projectId);
    };
    //
    // useEffect(() => {
    //     if (isRefreshing) {
    //         refreshProcessorStates()
    //     }
    // }, [isRefreshing, setIsRefreshing]);

    // useEffect(() => {
    //
    // }, [])
    //
    // const refreshProcessorStates = () => {
    //     if (isRefreshing) {
    //         console.info('refreshing processor states store, this includes workflow node and edge status information')
    //         const projectStates = fetchProjectProcessorStates()
    //         timeoutId = setTimeout(refreshProcessorStates, 1000);
    //     } else if (timeoutId) {
    //         clearTimeout(timeoutId)
    //     }
    // }

    return (<>
        {/* Project selection dropdown */}
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
        </div>

        {/* Add Project Button */}
        <button
            onClick={() => setIsOpenNewProjectDialog(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            <FontAwesomeIcon icon={faPlusSquare}/> New
        </button>

        {/* Add Project Button */}
        <button
            onClick={() => setIsOpenNewProjectDialog(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            <FontAwesomeIcon icon={faFolderOpen}/> Open
        </button>


            {/*/!*Manage of Instruction Templates (language, code, racketeer.. )*!/*/}
            {/*<InstructionTemplateDialog isOpen={isOpenInstructionTemplate} setIsOpen={setIsOpenInstructionTemplate}/>*/}
            {/*<MonitorLogEventViewDialog isOpen={isOpenMonitorLogEvent} setIsOpen={setIsOpenMonitorLogEvent} projectId={selectedProjectId}/>*/}
            {/*<NewProjectDialog isOpen={isOpenNewProjectDialog} setIsOpen={setIsOpenNewProjectDialog} />*/}
            {/*<UsageReportDialog isOpen={isOpenUsageReportDialog} setIsOpen={setIsOpenUsageReportDialog} />*/}

        </>
    );
}

const Topbar = () => {
    return (
        <div className="flex flex-col">
            <div className="w-full h-10 p-2 bg-black mb-0.5">
                <h1 className="flex-row flex"><FontAwesomeIcon icon={faDiagramProject} className="w-5 h-5 mr-2 mt-0.5"/>AGENTIC STUDIO</h1>
            </div>
            <div className="w-full h-14 bg-stone-50 p-2 shadow-sm drop-shadow-lg shadow-blue-300">
                <Menubar className="rounded-none border-b border-none px-2 lg:px-4">
                    <MenubarMenu>
                        <MenubarTrigger className="font-bold">File</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem className="hover:bg-blue-100">
                                New <MenubarShortcut>⌘N</MenubarShortcut>
                            </MenubarItem>
                            <MenubarItem className="hover:bg-blue-100">
                                Open <MenubarShortcut>⌘O</MenubarShortcut>
                            </MenubarItem>
                            <MenubarItem disabled>Save</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem className="text-red-600 hover:bg-red-100">Exit</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger className="font-bold">Edit</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem className="hover:bg-green-100">
                                Undo <MenubarShortcut>⌘Z</MenubarShortcut>
                            </MenubarItem>
                            <MenubarItem className="hover:bg-green-100">
                                Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
                            </MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem className="hover:bg-green-100">
                                Cut <MenubarShortcut>⌘X</MenubarShortcut>
                            </MenubarItem>
                            <MenubarItem className="hover:bg-green-100">
                                Copy <MenubarShortcut>⌘C</MenubarShortcut>
                            </MenubarItem>
                            <MenubarItem className="hover:bg-green-100">
                                Paste <MenubarShortcut>⌘V</MenubarShortcut>
                            </MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger className="font-bold">View</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem className="hover:bg-yellow-100">
                                Zoom In <MenubarShortcut>⌘+</MenubarShortcut>
                            </MenubarItem>
                            <MenubarItem className="hover:bg-yellow-100">
                                Zoom Out <MenubarShortcut>⌘-</MenubarShortcut>
                            </MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem className="hover:bg-yellow-100">Toggle Fullscreen</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                </Menubar>

                {/*<div className="flex flex-col items-start">*/}
                {/*    /!*Listing of projects and fetch from backend event*!/*/}
                {/*    /!*<div className="flex items-center justify-between w-full">*!/*/}
                {/*    /!*    /!* Left-aligned buttons and dropdown *!/*!/*/}
                {/*    /!*    <div className="flex items-center space-x-2">*!/*/}
                {/*    /!*         <ProjectSelector/>*!/*/}
                {/*    /!*    </div>*!/*/}
                {/*    */}
                {/*    /!*    /!* Right-aligned usage display *!/*!/*/}
                {/*    /!*    <div className="text-gray-600 font-bold">*!/*/}
                {/*    /!*        <OtherMenuItems/>*!/*/}
                {/*    /!*    </div>*!/*/}
                {/*    /!*</div>*!/*/}
                {/*</div>*/}
            </div>
        </div>
    );
};

export default Topbar;
