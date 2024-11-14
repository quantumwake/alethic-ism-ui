import React, {useEffect, useRef, useState} from 'react';
import useStore from './store';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Adjust the path as necessary

import {
    faCodeBranch, faDiagramProject, faFileCode,
    faFolderOpen, faPlusSquare, faSyncAlt, faTools, faWarning
} from '@fortawesome/free-solid-svg-icons'

import ProjectTemplateDialog from "./ProjectTemplateDialog";
import MonitorLogEventViewDialog from "./MonitorLogEventViewDialog";
import NewProjectDialog from "./NewProjectDialog";
import ProjectDialog from "./ProjectDialog";
import {faToolbox} from "@fortawesome/free-solid-svg-icons/faToolbox";
import {faStream} from "@fortawesome/free-solid-svg-icons/faStream";
import Tippy from "@tippyjs/react";

function OtherMenuItems() {
    const [isOpenProjectTemplate, setIsOpenProjectTemplate] = useState(false);

    return (<>
        {/* Open Instruction Template Button */}
        <button
            onClick={() => setIsOpenProjectTemplate(true)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded">
            <FontAwesomeIcon icon={faFileCode}/> Functions
        </button>

        {/*<UsageReportDialog isOpen={isOpenUsageReportDialog} setIsOpen={setIsOpenUsageReportDialog} />*/}
        <ProjectTemplateDialog isOpen={isOpenProjectTemplate} setIsOpen={setIsOpenProjectTemplate}/>
    </>)
}

function UsageReport() {
    const {jwtToken} = useStore()
    const {userProfile} = useStore()
    const {userUsageReport, fetchUsageReportGroupByUser} = useStore()
    const [isUsageRefreshing, setIsUsageRefreshing] = useState(true)
    const [usageTimeoutId, setUsageTimeoutId] = useState(null)

    const refreshUsage = async () => {
        if (usageTimeoutId) {
            clearTimeout(usageTimeoutId)
        }

        if (isUsageRefreshing) {
            console.info('updating agent usage units')
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

    const tooltip = "hello world"
    const calculateUsage = () => {
        if (!userUsageReport) {
            return "Pending"
        }
        return userUsageReport['total'] / userProfile?.max_agentic_units
    }

    return (
        <Tippy content="Agent Units (usage)">
            <div className={calculateUsage() > 1.0 ? 'text-red-600 animate-fade-in-out mr-10' : 'text-white mr-10'}>
                AUN: {calculateUsage()}
            </div>
        </Tippy>
    )
}


function Notifications() {
    const [isOpenMonitorLogEvent, setIsOpenMonitorLogEvent] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false)
    const {fetchProjectProcessorStates} = useStore()
    const timeoutId = useRef(null); // Use useRef for a persistent reference

    const refreshProcessorStates = async () => {
        if (isRefreshing) {
            console.info('Refreshing processor states store, including workflow node and edge status information');
            await fetchProjectProcessorStates();

            // Set a new timeout for the next refresh
            timeoutId.current = setTimeout(refreshProcessorStates, 1000);
        } else if (timeoutId.current) {
            clearTimeout(timeoutId.current);
            timeoutId.current = null; // Clear timeout when refreshing stops
        }
    };

    useEffect(() => {
        console.log(`is it refreshing: ${isRefreshing}`)
        if (isRefreshing) {
            refreshProcessorStates().then({

            })
        } else if (timeoutId.current) {
            clearTimeout(timeoutId.current);
            timeoutId.current = null;
        }

        // Clean up the timeout when the component unmounts
        return () => {
            if (timeoutId.current) clearTimeout(timeoutId.current);
        };
    }, [isRefreshing]); // Run effect when isRefreshing changes


    const toggleIsRefreshing = () => {
        const refresh = !isRefreshing
        setIsRefreshing(refresh)
    }

    return (<>
        <button
            onClick={() => setIsRefreshing((prev) => !prev)}
            className="bg-green-100 hover:bg-green-500 hover:text-white text-green-800 font-bold py-2 px-4 rounded">
            <FontAwesomeIcon
                icon={faSyncAlt}
                className={isRefreshing ? 'animate-[spin_3s_linear_infinite]' : ''}
            />
        </button>

        {/* Monitor Log Event Button */}
        <button
            onClick={() => setIsOpenMonitorLogEvent(true)}
            className="bg-red-100 hover:bg-red-500 hover:text-white text-red-600 font-bold py-2 px-4 rounded">
            <FontAwesomeIcon icon={faWarning}/>
        </button>

        <MonitorLogEventViewDialog isOpen={isOpenMonitorLogEvent} setIsOpen={setIsOpenMonitorLogEvent} />
    </>)
}

function ProjectSelector() {
    // const {userId, jwtToken} = useStore()
    const [isOpenNewProjectDialog, setIsOpenNewProjectDialog] = useState(false);
    const [isOpenProjectDialog, setIsOpenProjectDialog] = useState(false);

    return (<>
        {/* Add Project Button */}
        <button
            onClick={() => setIsOpenNewProjectDialog(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            <FontAwesomeIcon icon={faPlusSquare}/> New
        </button>

        {/* Add Project Button */}
        <button
            onClick={() => setIsOpenProjectDialog(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            <FontAwesomeIcon icon={faFolderOpen}/> Open
        </button>

        {/* Fork Code Button */}
        <button
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
            <FontAwesomeIcon icon={faCodeBranch}/> Share
        </button>

        {/* Fork Code Button */}
        <button
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
            <FontAwesomeIcon icon={faCodeBranch}/> Publish
        </button>

        {/*/!*Manage of Instruction Templates (language, code, racketeer.. )*!/*/}
        <ProjectDialog isOpen={isOpenProjectDialog} setIsOpen={setIsOpenProjectDialog} />
        <NewProjectDialog isOpen={isOpenNewProjectDialog} setIsOpen={setIsOpenNewProjectDialog} />
    </>);
}

const Topbar = ({callback}) => {

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

                         {/*Right-aligned usage display */}
                        {/*<div className="text-gray-600 font-bold space-x-2 ">*/}
                        {/*    <Tools callback={callback} />*/}
                        {/*</div>*/}

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
