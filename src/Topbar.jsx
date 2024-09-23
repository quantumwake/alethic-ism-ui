import React, {useEffect, useState} from 'react';
import useStore from './store';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Adjust the path as necessary

import {
    faCodeBranch, faDiagramProject, faFileCode,
    faFolderOpen, faPlusSquare, faSyncAlt, faWarning
} from '@fortawesome/free-solid-svg-icons'

import ProjectTemplateDialog from "./ProjectTemplateDialog";
import MonitorLogEventViewDialog from "./MonitorLogEventViewDialog";
// import UsageReportDialog from "./UsageCharts";
import NewProjectDialog from "./NewProjectDialog";
import ProjectDialog from "./ProjectDialog";
import InfoButton from "./InfoButton";

function OtherMenuItems() {
    const [isOpenProjectTemplate, setIsOpenProjectTemplate] = useState(false);
    const [isOpenUsageReportDialog, setIsOpenUsageReportDialog] = useState(false);
    // const {jwtToken} = useStore()


    return (<>
        {/* Open Instruction Template Button */}
        <button
            onClick={() => setIsOpenProjectTemplate(true)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded">
            <FontAwesomeIcon icon={faFileCode}/> Function Templates
        </button>

        {/*<UsageReportDialog isOpen={isOpenUsageReportDialog} setIsOpen={setIsOpenUsageReportDialog} />*/}
        <ProjectTemplateDialog isOpen={isOpenProjectTemplate} setIsOpen={setIsOpenProjectTemplate}/>
    </>)
}

function UsageReport() {
    const {jwtToken} = useStore()
    const {userUsageReport, fetchUsageReportGroupByUser} = useStore()
    const [isUsageRefreshing, setIsUsageRefreshing] = useState(true)
    const [usageTimeoutId, setUsageTimeoutId] = useState(null)

    const refreshUsage = async () => {
        if (usageTimeoutId) {
            clearTimeout(usageTimeoutId)
        }

        if (isUsageRefreshing) {
            console.info('refreshing processor states store, this includes workflow node and edge status information')
            await fetchUsageReportGroupByUser()
            const timeoutId = setTimeout(refreshUsage, 10000)
            setUsageTimeoutId(timeoutId)
        }
    }

    useEffect(() => {
        if (!jwtToken) {
            return
        }
        refreshUsage().then({
            // done refreshing
        })
    }, [jwtToken]); // Fetch projects when userId changes

    return (<div className="text-white bg-black mr-10">
        Platform Units: {userUsageReport && userUsageReport['total']}
    </div>)
}

function Notifications() {
    const {selectedProjectId} = useStore()

    const [isOpenMonitorLogEvent, setIsOpenMonitorLogEvent] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false)
    const {fetchProjectProcessorStates} = useStore()
    const timeoutId = useState(null)

    const refreshProcessorStates = async () => {
        if (isRefreshing) {
            console.info('refreshing processor states store, this includes workflow node and edge status information')
            await fetchProjectProcessorStates()
            setTimeout(refreshProcessorStates, 1000);
        } else if (timeoutId) {
            clearTimeout(timeoutId)
            setTimeout(null)
        }
    }

    useEffect(() => {
        if (isRefreshing) {
            refreshProcessorStates()
        }
    }, [isRefreshing, setIsRefreshing]);


    const toggleIsRefreshing = () => {
        setIsRefreshing(prev => !prev);
    }

    return (<>

        {/*<InfoButton id={selectedProjectId} details={selectedProjectId}></InfoButton>*/}

        <button
            onClick={toggleIsRefreshing}
            className="bg-green-100 hover:bg-green-500 hover:text-white text-green-800 font-bold py-2 px-4 rounded">
            {/*className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">*/}
            <FontAwesomeIcon
                icon={faSyncAlt}
                className={isRefreshing ? 'animate-[spin_3s_linear_infinite]' : ''}
            />
        </button>

        {/* Monitor Log Event Button */}
        <button
            onClick={() => setIsOpenMonitorLogEvent(true)}
            // className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            className="bg-red-100 hover:bg-red-500 hover:text-white text-red-600 font-bold py-2 px-4 rounded">
            {/*className="bg-orange-400 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded">*/}
            <FontAwesomeIcon icon={faWarning}/>
        </button>

        <MonitorLogEventViewDialog isOpen={isOpenMonitorLogEvent} setIsOpen={setIsOpenMonitorLogEvent} />

        {/*<div>Usage: {userUsageReport?.total || 0}</div>*/}
        {/*<button*/}
        {/*    onClick={() => setIsOpenUsageReportDialog(true)}*/}
        {/*    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">*/}
        {/*    <FontAwesomeIcon icon={faBlog}/>*/}
        {/*</button>*/}
    </>)
}

function ProjectSelector() {
    const {userId, jwtToken} = useStore()
    const [isOpenNewProjectDialog, setIsOpenNewProjectDialog] = useState(false);
    const [isOpenProjectDialog, setIsOpenProjectDialog] = useState(false);

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
    //
    // useEffect(() => {
    //     if (!jwtToken) {
    //         return
    //     }
    //     fetchProjects(userId);
    //     // refreshUsage()
    // }, [jwtToken]); // Fetch projects when userId changes

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
        {/* Add Project Button */}
        <button
            onClick={() => setIsOpenNewProjectDialog(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            <FontAwesomeIcon icon={faPlusSquare}/> New Project
        </button>

        {/* Add Project Button */}
        <button
            onClick={() => setIsOpenProjectDialog(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            <FontAwesomeIcon icon={faFolderOpen}/> Open Project
        </button>

        {/* Fork Code Button */}
        <button
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
            <FontAwesomeIcon icon={faCodeBranch}/> Share Project
        </button>

        {/*/!*Manage of Instruction Templates (language, code, racketeer.. )*!/*/}
        <ProjectDialog isOpen={isOpenProjectDialog} setIsOpen={setIsOpenProjectDialog} />
        <NewProjectDialog isOpen={isOpenNewProjectDialog} setIsOpen={setIsOpenNewProjectDialog} />
    </>);
}

const Topbar = () => {

    return (
        <div className="flex flex-col">
            <div className="w-full h-10 p-2 bg-black mb-0.5">
                <div className="flex flex-col items-start">
                    <div className="flex items-center justify-between w-full">
                        {/* Left-aligned buttons and dropdown */}
                        <div className="flex items-center">
                            <h1 className="flex-row flex">
                                <FontAwesomeIcon icon={faDiagramProject} className="w-5 h-5 mr-2 mt-0.5"/>
                                AGENTIC STUDIO
                            </h1>
                        </div>

                        {/* Right-aligned usage display */}
                        <div className="text-gray-600 font-bold space-x-2 ">
                            <UsageReport />
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full h-14 bg-stone-50 p-2 shadow-sm drop-shadow-lg shadow-blue-300">
                <div className="flex flex-col items-start">
                    <div className="flex items-center justify-between w-full">
                        {/* Left-aligned buttons and dropdown */}
                        <div className="flex items-center space-x-2">
                            <ProjectSelector/>
                            <OtherMenuItems/>
                        </div>

                        {/* Right-aligned usage display */}
                        <div className="text-gray-600 font-bold space-x-2 ">
                            <Notifications/>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Topbar;
