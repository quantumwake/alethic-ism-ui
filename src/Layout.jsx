import React, { useState } from "react";
import {
    LayoutGrid,
    LucideSquareFunction,
    WorkflowIcon,
    Menu,
    Files,
    Settings,
    List
} from 'lucide-react';
import {
    TerminalTabBar,
    TerminalContainer,
    TerminalHeader,
    TerminalSidebar,
    TerminalFooter
}  from "./components/common";

import MenuTab from "./tabs/MenuTab";
import FileTab from "./tabs/FileTab";
import ProjectTab from "./tabs/ProjectTab";
import ComponentTab from "./tabs/ComponentTab";
import PropertyTab from "./tabs/PropertyTab";
import TerminalUserMenu from "./components/ism/TerminalUserMenu";

import Studio2 from "./Studio2";
import useStore from "./store";
import TerminalSyslog from "./components/ism/TerminalSyslog";

const TAB_COMPONENTS = {
    component: ComponentTab,
    files: FileTab,
    project: ProjectTab,
    property: PropertyTab,
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
    const [activeRightTab, setActiveRightTab] = useState("property");
    const {setActiveTheme} = useStore()
    const {isSyslogOpen, setIsSyslogOpen} = useState(false)

    const leftTabs = [
        { id: 'menu', icon: <Menu className="w-4 h-4" /> },
        { id: 'component', icon: <LucideSquareFunction className="w-4 h-4" /> },
        { id: 'project', icon: <WorkflowIcon className="w-4 h-4" /> },
        { id: 'files', icon: <Files className="w-4 h-4" /> }
    ];

    const rightTabs = [
        { id: 'property', icon: <Settings className="w-4 h-4" /> },
        { id: 'logs', icon: <List className="w-4 h-4" /> }
    ];

    const handleItemClick = (item) => {
        // Different handling based on tab type
        switch(activeLeftTab) {
            case 'processors':
                // Handle processor selection
                console.log('Selected processor:', item);
                // Add processor to canvas, open configuration, etc.
                break;
            case 'menu':
                // Handle menu navigation
                console.log('Selected menu item:', item);
                // Navigate to route, open panel, etc.
                break;
            case 'files':
                // Handle file selection
                console.log('Selected file:', item);
                // Open file, show preview, etc.
                break;
        }
    };

    return (
        <TerminalContainer className="h-screen flex flex-col">
            <TerminalHeader
                leftContent={<>
                    <LayoutGrid className="w-4 h-4" />
                    <span>Instruction State Machine (ISM)</span>
                </>}

                rightContent={<>
                    <TerminalSyslog></TerminalSyslog>
                    <TerminalUserMenu onThemeChange={setActiveTheme} />
                </>}>
            </TerminalHeader>

            <div className="flex flex-1 overflow-hidden">
                <TerminalSidebar position="left" isOpen={isLeftSidebarOpen} onToggle={() => setLeftSidebarOpen(!isLeftSidebarOpen)}
                    tabContent={
                        <TerminalTabBar
                            tabs={leftTabs}
                            activeTab={activeLeftTab}
                            onTabChange={setActiveLeftTab}
                            onToggle={() => setLeftSidebarOpen(!isLeftSidebarOpen)}
                            position="left">
                        </TerminalTabBar>
                    }
                    mainContent={
                        <TerminalTabContent
                            activeTab={activeLeftTab}
                            onItemClick={handleItemClick}>
                        </TerminalTabContent>
                    }
                />

                <main className="flex-1 p-0 overflow-auto">
                    <Studio2 />
                    {/*<TerminalSection title="Welcome" className="h-full">*/}
                        {/*Type 'help' for available commands*/}
                        {/*<TerminalCursor />*/}
                    {/*</TerminalSection>*/}
                </main>

                <TerminalSidebar position="right" isOpen={isRightSidebarOpen} onToggle={() => setRightSidebarOpen(!isRightSidebarOpen)}
                    tabContent={
                        <TerminalTabBar
                            tabs={rightTabs}
                            activeTab={activeRightTab}
                            onTabChange={setActiveRightTab}
                            onToggle={() => setRightSidebarOpen(!isRightSidebarOpen)}
                            position="right">
                        </TerminalTabBar>
                    }
                    mainContent={
                        <TerminalTabContent
                            activeTab={activeRightTab}
                            onItemClick={handleItemClick}>
                        </TerminalTabContent>
                    }
                />
            </div>

            <TerminalFooter
                leftContent="SYSTEM STATUS: ACTIVE"
                rightContent="V1.0.0">
            </TerminalFooter>
        </TerminalContainer>
    );
};

export default Layout;