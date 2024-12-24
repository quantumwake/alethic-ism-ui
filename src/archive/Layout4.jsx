import React, { useState } from "react";
import useStore from "../store";
import {
    ChevronRight,
    ChevronLeft,
    Menu,
    Files,
    Settings,
    List,
    LayoutGrid,
    Bell,
    User
} from 'lucide-react';

const Layout = () => {
    const theme = useStore(state => state.getCurrentTheme());
    const [isLeftSidebarOpen, setLeftSidebarOpen] = useState(true);
    const [isRightSidebarOpen, setRightSidebarOpen] = useState(true);
    const [activeLeftTab, setActiveLeftTab] = useState("menu");
    const [activeRightTab, setActiveRightTab] = useState("properties");

    const getEffectClasses = () => {
        const classes = [];
        if (theme.effects?.enableScanlines) {
            classes.push(theme.effects.scanlineClass);
        }
        if (theme.effects?.enableCrt) {
            classes.push(theme.effects.crtClass);
        }
        return classes.join(' ');
    };

    const TabButton = ({ isActive, onClick, children }) => (
        <button
            onClick={onClick}
            className={`flex items-center justify-center w-full p-2
                ${isActive ? theme.textAccent : theme.text}
                ${theme.hover}`}
        >
            {children}
        </button>
    );

    return (
        // Apply effects to the main container
        <div className={`h-screen flex flex-col ${theme.bg} ${theme.text} ${theme.font} ${getEffectClasses()}`}>
            {/* Header */}
            <header className={`h-12 px-4 flex items-center justify-between border-b ${theme.border}`}>
                <div className="flex items-center gap-2">
                    <LayoutGrid className={`w-4 h-4 ${theme.textAccent}`} />
                    <span className={theme.textAccent}>TERMINAL</span>
                </div>
                <div className="flex items-center gap-4">
                    <button className={theme.hover}>
                        <Bell className={`w-4 h-4 ${theme.icon}`} />
                    </button>
                    <button className={theme.hover}>
                        <User className={`w-4 h-4 ${theme.icon}`} />
                    </button>
                </div>
            </header>

            {/* Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar */}
                <aside className={`${isLeftSidebarOpen ? 'w-64' : 'w-12'} flex border-r ${theme.border} transition-all duration-200`}>
                    {/* Tab Bar */}
                    <div className={`w-12 flex flex-col py-2 gap-1 border-r ${theme.border}`}>
                        <TabButton
                            isActive={activeLeftTab === "menu"}
                            onClick={() => setActiveLeftTab("menu")}
                        >
                            <Menu className="w-4 h-4" />
                        </TabButton>
                        <TabButton
                            isActive={activeLeftTab === "files"}
                            onClick={() => setActiveLeftTab("files")}
                        >
                            <Files className="w-4 h-4" />
                        </TabButton>
                        <div className="mt-auto">
                            <button
                                onClick={() => setLeftSidebarOpen(!isLeftSidebarOpen)}
                                className={theme.hover}
                            >
                                {isLeftSidebarOpen ?
                                    <ChevronLeft className="w-4 h-4" /> :
                                    <ChevronRight className="w-4 h-4" />
                                }
                            </button>
                        </div>
                    </div>

                    {/* Sidebar Content */}
                    {isLeftSidebarOpen && (
                        <div className="flex-1">
                            <div className={`px-3 py-2 border-b ${theme.border}`}>
                                {activeLeftTab === "menu" ? "> MENU" : "> FILES"}
                            </div>
                            <div className="p-2">
                                {activeLeftTab === "menu" && (
                                    <nav className="space-y-1">
                                        {['Dashboard', 'Projects', 'Team', 'Analytics'].map((item) => (
                                            <button
                                                key={item}
                                                className={`w-full text-left px-3 py-1.5 ${theme.hover}`}
                                            >
                                                <span className={theme.textAccent}>$</span> {item}
                                            </button>
                                        ))}
                                    </nav>
                                )}
                            </div>
                        </div>
                    )}
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4 overflow-auto">
                    <div className={`border ${theme.border} h-full p-4`}>
                        <div className={`${theme.textAccent} mb-4`}> WELCOME TO TERMINAL</div>
                        <div className={theme.text}>
                            Type 'help' for available commands
                            <div className={`w-2 h-4 inline-block ml-1 ${theme.textAccent} animate-pulse`}>_</div>
                        </div>
                    </div>
                </main>

                {/* Right Sidebar - Similar updates to left sidebar */}
                <aside className={`${isRightSidebarOpen ? 'w-64' : 'w-12'} flex border-l ${theme.border} transition-all duration-200`}>
                    {isRightSidebarOpen && (
                        <div className="flex-1">
                            <div className={`px-3 py-2 border-b ${theme.border}`}>
                                {activeRightTab === "properties" ? "> PROPERTIES" : "> LOGS"}
                            </div>
                            <div className="p-2">
                                {activeRightTab === "properties" && (
                                    <div className={theme.text}>
                                        <span className={theme.textAccent}>$</span> System Properties
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <div className={`w-12 flex flex-col py-2 gap-1 border-l ${theme.border}`}>
                        <TabButton
                            isActive={activeRightTab === "properties"}
                            onClick={() => setActiveRightTab("properties")}
                        >
                            <Settings className="w-4 h-4" />
                        </TabButton>
                        <TabButton
                            isActive={activeRightTab === "logs"}
                            onClick={() => setActiveRightTab("logs")}
                        >
                            <List className="w-4 h-4" />
                        </TabButton>
                        <div className="mt-auto">
                            <button
                                onClick={() => setRightSidebarOpen(!isRightSidebarOpen)}
                                className={theme.hover}
                            >
                                {isRightSidebarOpen ?
                                    <ChevronRight className="w-4 h-4" /> :
                                    <ChevronLeft className="w-4 h-4" />
                                }
                            </button>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Footer */}
            <footer className={`h-8 px-4 flex items-center justify-between border-t ${theme.border}`}>
                <span className={theme.textMuted}>SYSTEM STATUS: ACTIVE</span>
                <span className={theme.textMuted}>V1.0.0</span>
            </footer>
        </div>
    );
};

export default Layout;