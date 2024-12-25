import React, { useState, useEffect } from 'react';
import {useStore} from '../store';
import {
    Calendar,
    ChevronRight,
    ChevronDown,
    Clock,
    Search,
    File,
} from 'lucide-react';

const ProjectTab = () => {
    const theme = useStore(state => state.getCurrentTheme());
    const {
        userId,
        jwtToken,
        projects,
        fetchProjects,
        fetchWorkflowNodes,
        fetchWorkflowEdges,
        fetchTemplates,
        fetchProviders,
        setSelectedProjectId
    } = useStore();

    const [expandedGroups, setExpandedGroups] = useState(new Set(['recent']));
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (jwtToken) {
            fetchProjects(userId);
        }
    }, [jwtToken, userId, fetchProjects]);

    const onSelectProject = async (project) => {
        const projectId = project.project_id;
        await fetchWorkflowNodes(projectId);
        await fetchWorkflowEdges(projectId);
        await fetchTemplates(projectId);
        await fetchProviders();
        setSelectedProjectId(projectId);
    };

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
        project.project_name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const groupedProjects = groupProjectsByTime(filteredProjects);

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
                                className={`w-full text-left px-3 py-1 ${theme.hover} flex items-center gap-2`}
                            >
                                <File className={`w-3 h-3 ${theme.icon}`}/>
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
                <Clock className={`w-3 h-3 ${theme.icon}`} />
            </div>

            <div className="flex-1 overflow-y-auto">
                {renderGroup('Today', groupedProjects.today, 'today')}
                {renderGroup('This Week', groupedProjects.thisWeek, 'thisWeek')}
                {renderGroup('This Month', groupedProjects.thisMonth, 'thisMonth')}
                {renderGroup('Older', groupedProjects.older, 'older')}
            </div>
        </div>
    );
};

export default ProjectTab;