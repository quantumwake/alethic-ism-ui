import React, { useState } from 'react';
import {
    Plus,
    FolderOpen,
    GitFork,
    Share2,
    Lock,
    AlertTriangle,
    Workflow,
    RefreshCw,
    FileCode
} from 'lucide-react';
import {useStore} from "./store";
import ProjectTemplateDialog from "./ProjectTemplateDialog";
import MonitorLogEventViewDialog from "./components/ism/TerminalSyslog";
import NewProjectDialog from "./NewProjectDialog";
import ProjectDialog from "./archive/ProjectDialog";

function IconButton({ icon: Icon, label, onClick, className = "" }) {
    const theme = useStore(state => state.getCurrentTheme());

     return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border 
                ${theme.bg} ${theme.border} ${theme.hover} ${theme.font}
                text-xs transition-colors ${className}`}
        >
            <Icon className={theme.textAccent} size={14} />
            {label && <span className={theme.text}>{label}</span>}
        </button>
    )
}

function OtherMenuItems({  }) {
    const [isOpenProjectTemplate, setIsOpenProjectTemplate] = useState(false);
    const theme = useStore(state => state.getCurrentTheme());

    return (
        <>
            <IconButton
                icon={FileCode}
                label="Functions"
                theme={theme}
                onClick={() => setIsOpenProjectTemplate(true)}
            />
            <ProjectTemplateDialog isOpen={isOpenProjectTemplate} setIsOpen={setIsOpenProjectTemplate} />
        </>
    );
}

function UsageReport({ }) {
    const { userProfile, userUsageReport } = useStore();
    const theme = useStore(state => state.getCurrentTheme());

    const calculateUsage = () => {
        if (!userUsageReport) return "Pending";
        return userUsageReport['total'] / userProfile?.max_agentic_units;
    };

    const usage = calculateUsage();
    return (
        <div
            title="Agent Units (usage)"
            className={`${theme.font} text-xs ${usage > 1.0 ? 'text-red-500' : theme.textAccent}`}
        >
            AUN: {usage}
        </div>
    );
}

function Notifications({ }) {
    const [isOpenMonitorLogEvent, setIsOpenMonitorLogEvent] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const theme = useStore(state => state.getCurrentTheme());

    return (
        <>
            <IconButton
                icon={RefreshCw}
                theme={theme}
                className={isRefreshing ? 'animate-[spin_3s_linear_infinite]' : ''}
                onClick={() => setIsRefreshing(prev => !prev)}
            />
            <IconButton
                icon={AlertTriangle}
                theme={theme}
                onClick={() => setIsOpenMonitorLogEvent(true)}
            />
            <MonitorLogEventViewDialog isOpen={isOpenMonitorLogEvent} setIsOpen={setIsOpenMonitorLogEvent} />
        </>
    );
}

function ProjectSelector({ }) {
    const [isOpenNewProjectDialog, setIsOpenNewProjectDialog] = useState(false);
    const [isOpenProjectDialog, setIsOpenProjectDialog] = useState(false);
    const theme = useStore(state => state.getCurrentTheme());

    return (
        <>
            <div className="flex items-center gap-2">
                <IconButton
                    icon={Plus}
                    label="New"
                    theme={theme}
                    onClick={() => setIsOpenNewProjectDialog(true)}
                />
                <IconButton
                    icon={FolderOpen}
                    label="Open"
                    theme={theme}
                    onClick={() => setIsOpenProjectDialog(true)}
                />
                <div className={`h-4 w-px ${theme.border}`} />
                <IconButton
                    icon={Share2}
                    label="Share"
                    theme={theme}
                />
                <IconButton
                    icon={GitFork}
                    label="Publish"
                    theme={theme}
                />
                <IconButton
                    icon={Lock}
                    label="Vault"
                    theme={theme}
                />
            </div>
            <ProjectDialog isOpen={isOpenProjectDialog} setIsOpen={setIsOpenProjectDialog} />
            <NewProjectDialog isOpen={isOpenNewProjectDialog} setIsOpen={setIsOpenNewProjectDialog} />
        </>
    );
}

const Topbar = ({ callback }) => {
    const theme = useStore(state => state.getCurrentTheme());

    return (
        <div className={`flex flex-col ${theme.font}`}>
            <div className={`w-full h-8 ${theme.bg}`}>
                <div className="flex items-center justify-between w-full px-2 h-full">
                    <div className="flex items-center gap-2">
                        <Workflow className={`w-4 h-4 ${theme.textAccent}`} />
                        <span className={`text-xs ${theme.text}`}>AGENTIC STUDIO</span>
                    </div>
                    <UsageReport theme={theme} />
                </div>
            </div>

            <div className={`w-full border-t border-b ${theme.border} ${theme.bg}`}>
                <div className="flex items-center justify-between w-full px-2 py-1">
                    <div className="flex items-center gap-2">
                        <ProjectSelector theme={theme} />
                        <div className={`h-4 w-px ${theme.border}`} />
                        <OtherMenuItems theme={theme} />
                    </div>
                    <div className="flex items-center gap-2">
                        <Notifications theme={theme} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Topbar;