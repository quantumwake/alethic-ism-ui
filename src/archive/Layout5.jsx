import React, { useState } from "react";
import {
    LayoutGrid,
    LucideSquareFunction,
    Bell,
    User,
    Menu,
    Files,
    Settings,
    List
} from 'lucide-react';
// import {
//     TerminalContainer,
//     TerminalHeader,
//     TerminalSidebar,
//     TerminalSection,
//     TerminalButton,
//     TerminalFooter,
//     TerminalCursor
// } from './components/';
import TerminalTabBar from "../components/TerminalTabBar";
import TerminalContainer from "../components/TerminalContainer";
import TerminalHeader from "../components/TerminalHeader";
import TerminalSection from "../components/TerminalSection";
import TerminalCursor from "../components/TerminalCursor";
import TerminalSidebar from "../components/TerminalSidebar";
import TerminalFooter from "../components/TerminalFooter";
import TerminalButton from "../components/TerminalButton";
import ComponentTab from "../tabs/ComponentTab";
import MenuTab from "../tabs/MenuTab";
import FileTab from "../tabs/FileTab";

const TAB_COMPONENTS = {
    processors: ComponentTab,
    files: FileTab,
    menu: MenuTab
};

export const TerminalTabContent = ({ activeTab, ...props }) => {
    const TabComponent = TAB_COMPONENTS[activeTab];

    if (!TabComponent) {
        return null;
    }

    return <TabComponent {...props} />;
};

const Layout = () => {
    const [isLeftSidebarOpen, setLeftSidebarOpen] = useState(true);
    const [isRightSidebarOpen, setRightSidebarOpen] = useState(true);
    const [activeLeftTab, setActiveLeftTab] = useState("menu");
    const [activeRightTab, setActiveRightTab] = useState("properties");

    const leftTabs = [
        { id: 'menu', icon: <Menu className="w-4 h-4" /> },
        { id: 'processors', icon: <LucideSquareFunction className="w-4 h-4" /> },
        { id: 'files', icon: <Files className="w-4 h-4" /> }
    ];

    const rightTabs = [
        { id: 'properties', icon: <Settings className="w-4 h-4" /> },
        { id: 'logs', icon: <List className="w-4 h-4" /> }
    ];

    return (
        <TerminalContainer className="h-screen flex flex-col">
            <TerminalHeader
                leftContent={
                    <>
                        <LayoutGrid className="w-4 h-4" />
                        <span>TERMINAL</span>
                    </>
                }
                rightContent={
                    <>
                        <Bell className="w-4 h-4" />
                        <User className="w-4 h-4" />
                    </>
                }
            />

            <div className="flex flex-1 overflow-hidden">
                <TerminalSidebar
                    isOpen={isLeftSidebarOpen}
                    onToggle={() => setLeftSidebarOpen(!isLeftSidebarOpen)}
                    position="left"
                    tabContent={
                        <TerminalTabBar
                            tabs={leftTabs}
                            activeTab={activeLeftTab}
                            onTabChange={setActiveLeftTab}
                            onToggle={() => setLeftSidebarOpen(!isLeftSidebarOpen)}
                            position="left"
                        />
                    }
                    
                    mainContent={
                        <TerminalSection title={activeLeftTab === "menu" ? "Menu" : "Files"}>
                            {activeLeftTab === "menu" && (
                                <nav className="space-y-1">
                                    {['Dashboard', 'Projects', 'Team', 'Analytics'].map(item => (
                                        <TerminalButton key={item}>
                                            {item}
                                        </TerminalButton>
                                    ))}
                                </nav>
                            )}
                        </TerminalSection>
                    }
                />

                <main className="flex-1 p-4 overflow-auto">
                    <TerminalSection title="Welcome" className="h-full">
                        Type 'help' for available commands
                        <TerminalCursor />
                    </TerminalSection>
                </main>

                <TerminalSidebar
                    isOpen={isRightSidebarOpen}
                    onToggle={() => setRightSidebarOpen(!isRightSidebarOpen)}
                    position="right"
                    tabContent={
                        <TerminalTabBar
                            tabs={rightTabs}
                            activeTab={activeRightTab}
                            onTabChange={setActiveRightTab}
                            onToggle={() => setRightSidebarOpen(!isRightSidebarOpen)}
                            position="right"
                        />
                    }
                    mainContent={
                        <TerminalSection title={activeRightTab === "properties" ? "Properties" : "Logs"}>
                            {activeRightTab === "properties" ? "System Properties" : "System Logs"}
                        </TerminalSection>
                    }
                />
            </div>

            <TerminalFooter
                leftContent="SYSTEM STATUS: ACTIVE"
                rightContent="V1.0.0"
            />
        </TerminalContainer>
    );
};

export default Layout;