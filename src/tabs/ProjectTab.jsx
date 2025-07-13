import React, {useState, useEffect, useRef} from 'react';
import {useStore} from '../store';
import {
    Calendar,
    ChevronRight,
    ChevronDown,
    Clock,
    Search,
    File, PencilIcon, TrashIcon, CopyIcon, LogsIcon, ShareIcon, Share2Icon, ScaleIcon, PlusSquareIcon, SquareMenuIcon,
} from 'lucide-react';
import {TerminalInput, TerminalContextMenu, TerminalInfoButton} from "../components/common";

const ProjectTab = () => {
    const theme = useStore(state => state.getCurrentTheme());
    const {
        userId,
        jwtToken,
        projects,
        selectedProjectId,
        newProject,
        saveProject,
        fetchProjects,
        fetchStatesByProject,
        fetchWorkflowNodes,
        fetchWorkflowEdges,
        fetchTemplates,
        fetchProviders,
        setSelectedProjectId,
        setCurrentWorkspace,
    } = useStore();

    const [newProjectName, setNewProjectName] = useState(null)

    const [expandedGroups, setExpandedGroups] = useState(new Set(['recent']));
    const [searchTerm, setSearchTerm] = useState('');
    const [isContextMenuOpen, setIsContextMenuOpen] = useState(false)
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
    const [contextMenuItems, setContextMenuItems] = useState([])
    const contextMenuRef = useRef(null)

    //
    useEffect(() => {
        if (jwtToken) {
            fetchProjects(userId).then(r => {
                console.debug(`fetched all projects for user ${userId}`)
            });
        }
    }, [jwtToken, userId, fetchProjects]);

    // update context menus based on selected item
    useEffect(() => {
        // if (!selectedProjectId) {
        //     return
        // }

        let options = []
        // if (selectedProjectId.type === "directory") {
            options.push({
                id: 'new',
                label: 'New Project',
                icon: PlusSquareIcon
            })
        // } else if (selectedItem.type === "file") {
            options.push(
                {
                    id: 'rename',
                    label: 'Rename Project',
                    icon: PencilIcon,
                },
                {
                    id: 'delete',
                    label: 'Delete Project',
                    icon: TrashIcon,
                    danger: true
                },
                {
                    id: 'clone',
                    label: 'Clone Project',
                    icon: CopyIcon
                },
                {
                    id: 'clone',
                    label: 'Share Project',
                    icon: Share2Icon
                },
                {
                    id: 'clone',
                    label: 'Publish as Component',
                    icon: ShareIcon
                },
                {
                    id: 'clone',
                    label: 'Scale',
                    icon: ScaleIcon
                },
                {
                    id: 'clone',
                    label: 'Event Log',
                    icon: LogsIcon
                }
            )
        // }

        setContextMenuItems(options)
    }, []);

    const onSelectProject = async (project) => {
        const projectId = project.project_id;
        console.debug(`selecting project id ${projectId}`)
        fetchWorkflowNodes(projectId).then(r => {
            // fetchStatesByProject(projectId).then(r => {
            //     console.log("fetched states for project")
            // })
        });
        await fetchWorkflowEdges(projectId);
        await fetchTemplates(projectId);
        await fetchProviders();
        setSelectedProjectId(projectId);
        setCurrentWorkspace("studio")
    };

    const handleItemClick = (item) => {
        console.debug(`item: ${item}`)
        switch (item.id) {
            case "new":
                setNewProjectName("project name") // this enables the terminal input for a new project
                break
            case "clone":

        }
    }

    const groupProjectsByTime = (projects) => {
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeek = 7 * oneDay;
        const oneMonth = 30 * oneDay;

        return projects.reduce((groups, project) => {
            const projectDate = new Date(project.created_date);
            const diff = now - projectDate;

            if (diff < oneDay) {
                groups.today.push(project);
            } else if (diff < oneWeek) {
                groups.thisWeek.push(project);
            } else if (diff < oneMonth) {
                groups.thisMonth.push(project);
            } else {
                groups.older.push(project);
            }

            return groups;
        }, {
            today: [],
            thisWeek: [],
            thisMonth: [],
            older: []
        });
    };

    const toggleGroup = (groupId) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(groupId)) {
                next.delete(groupId);
            } else {
                next.add(groupId);
            }
            return next;
        });
    };

    const filteredProjects = projects?.filter(project =>
        project?.project_name?.toLowerCase().includes(searchTerm?.toLowerCase())
    ) || [];

    // const groupedProjects = groupProjectsByTime(filteredProjects);

    const [groupedProjects, setGroupedProjects] = useState()

    useEffect(() => {
        const grouped = groupProjectsByTime(filteredProjects);
        setGroupedProjects(grouped)
    }, [projects, searchTerm]);

    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Get the mouse coordinates from the event
        const clickX = e.clientX;
        const clickY = e.clientY;

        setContextMenuPosition({ x: clickX, y: clickY });
        setIsContextMenuOpen(true)
    };

    const handleNewProjectKeyDown = async(event) => {
        if (event.key === "Enter") {
            // create the new project
            const project = await newProject(event.target.value)
            await saveProject(project);
            setNewProjectName(null)
            // setNewProjectName(); // clear after saving
        }
    };

    const renderGroup = (title, projects, groupId) => {
        if (projects.length === 0) return null;
        const isExpanded = expandedGroups.has(groupId);

        return (
            <div key={groupId} className={`border-b ${theme.border}`}>
                <button
                    onClick={() => toggleGroup(groupId)}
                    className={`w-full flex items-center px-2 py-1 ${theme.hover}`}
                >
                    {isExpanded ? (
                        <ChevronDown className={`w-3 h-3 ${theme.icon}`} />
                    ) : (
                        <ChevronRight className={`w-3 h-3 ${theme.icon}`} />
                    )}
                    <Calendar className={`w-3 h-3 ${theme.icon} ml-1`} />
                    <span className={`text-xs ml-2 ${theme.text}`}>
                        {title} ({projects.length})
                    </span>
                </button>

                {isExpanded && (
                    <div className="space-y-1 py-1">

                        {projects.map(project => (
                            <button
                                key={project.project_id}
                                onClick={() => onSelectProject(project)}
                                onContextMenu={(e) => handleContextMenu(e)}  // Add this line
                                className={`w-full text-left px-3 py-1 ${theme.hover} flex items-center gap-2`}
                            >
                                {/*<File className={`w-3 h-3 ${theme.icon}`}/>*/}
                                <TerminalInfoButton id={project.project_id} details={project.project_name}  className={`w-3 h-3 ${theme.icon}`} theme={theme} icon={<File className={`w-3 h-3 ${theme.icon}`}/>}/>

                                {project?.project_id && (
                                    <div className="flex flex-col">
                                        <span className={`text-xs ${theme.text}`}>
                                          {project.project_name}
                                        </span>

                                        <span className={`text-xs ${theme.textMuted}`}>
                                            {new Date(project.created_date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full">
            <div className={`flex items-center p-2 border-b ${theme.border}`}>
                <Search className={`w-3 h-3 ${theme.icon}`}/>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full bg-transparent text-xs ${theme.text} focus:outline-none px-2`}
                    placeholder="Search projects..."
                />
                <Clock className={`w-3 h-3 ${theme.icon}`}/>
                <SquareMenuIcon className={`ml-2 w-3 h-3 ${theme.icon}`} onClick={() => setIsContextMenuOpen(true)}/>
            </div>
            {newProjectName !== null && (

            <div className={`flex items-center p-2 border-b ${theme.border}`}>
                <TerminalInput
                    value={newProjectName}
                    placeholder="enter project name"
                    size="small"
                    variant="primary"
                    onChange={(o) => setNewProjectName(o.value)}
                    onKeyDown={handleNewProjectKeyDown}
                />
            </div>)}

            <div className="flex-1 overflow-y-auto">
                {groupedProjects && (
                    <>
                        {renderGroup('Today', groupedProjects.today, 'today')}
                        {renderGroup('This Week', groupedProjects.thisWeek, 'thisWeek')}
                        {renderGroup('This Month', groupedProjects.thisMonth, 'thisMonth')}
                        {renderGroup('Older', groupedProjects.older, 'older')}
                    </>
                )}
            </div>

            <TerminalContextMenu menuRef={contextMenuRef}
                                 isOpen={isContextMenuOpen}
                                 setIsOpen={setIsContextMenuOpen}
                                 menuItems={contextMenuItems}
                                 onItemClick={handleItemClick}
                                 menuPosition={contextMenuPosition}/>
        </div>
    );
};

export default ProjectTab;