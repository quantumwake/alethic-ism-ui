import React, {useState} from "react";
import {
    LayoutGrid,
    Menu,
    Settings,
    List,
    LayoutIcon,
    FolderOpenIcon,
    BoxesIcon
} from 'lucide-react'

import {
    TerminalTabBar,
    TerminalContainer,
    TerminalHeader,
    TerminalSidebar,
    TerminalFooter, TerminalTabView
} from "./components/common"

import {useStore} from "./store"

import {MenuTab, ProjectTab, ProjectFileTab, ComponentTab, PropertyTab}  from "./tabs"
import {TerminalTemplateEditor, TerminalUsageReport, TerminalSyslog, TerminalUserMenu} from "./components/ism"
import Studio from "./Studio"
import CustomStudio from "./CustomStudio"

const TAB_COMPONENTS = {
    component: ComponentTab,
    files: ProjectFileTab,
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

    const leftTabs = [
        { id: 'menu', icon: <Menu className="w-4 h-4" /> },
        { id: 'project', icon: <LayoutIcon className="w-4 h-4" /> },
        { id: 'component', icon: <BoxesIcon className="w-4 h-4" /> },
        { id: 'files', icon: <FolderOpenIcon className="w-4 h-4" /> }
    ];

    const rightTabs = [
        { id: 'property', icon: <Settings className="w-4 h-4" /> },
        { id: 'logs', icon: <List className="w-4 h-4" /> }
    ];
    const handleItemClick = (item) => {
        // // Different handling based on tab type
        // switch(activeLeftTab) {
        //     case 'processors':
        //         // Handle processor selection
        //         console.log('Selected processor:', item);
        //         // Add processor to canvas, open configuration, etc.
        //         break;
        //     case 'menu':
        //         // Handle menu navigation
        //         console.log('Selected menu item:', item);
        //         // Navigate to route, open panel, etc.
        //         break;
        //     case 'files':
        //         // Handle file selection
        //         console.log('Selected file:', item);
        //         // Open file, show preview, etc.
        //         break;
        // }

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
                    tabContent={<div className="flex w-12 flex-none">
                        <TerminalTabBar
                            className="w-12"
                            tabs={leftTabs}
                            activeTab={activeLeftTab}
                            onTabChange={setActiveLeftTab}
                            onToggle={() => setLeftSidebarOpen(!isLeftSidebarOpen)}
                            position="left">
                        </TerminalTabBar>
                    </div>}
                    mainContent={<div className="flex-1  overflow-auto">
                        <TerminalTabContent
                            activeTab={activeLeftTab}
                            onItemClick={handleItemClick}>
                        </TerminalTabContent>
                    </div>}
                />

                <main className="flex-1 p-0 overflow-auto">
                    <TerminalTabView
                        tabs={[
                            {
                                name: 'studio',
                                label: 'Studio',
                                content: <Studio />, // Assuming you have Studio and TerminalTemplateEditor components
                                closeable: false,
                            },
                            {
                                name: 'studio poc',
                                label: 'Studio PoC',
                                content: <CustomStudio />, // Assuming you have Studio and TerminalTemplateEditor components
                                closeable: false,
                            },
                            // {
                            //     name: 'studio poc',
                            //     label: 'Query Editor',
                            //     content: <QueryBuilder
                            //         stateId="9ab0f4ac-3d87-4437-9528-0163cc5367a8"
                            //         userId="77c17315-3013-5bb8-8c42-32c28618101f"
                            //     />, // Assuming you have Studio and TerminalTemplateEditor components
                            //     closeable: false,
                            // },
                            {
                                name: 'editor',
                                label: 'Editor',
                                content: <TerminalTemplateEditor />,
                                closeable: false,
                            },

                        ]}
                        position="bottom"
                        onTabClose={(index) => console.log('Close tab', index)}
                        onTabSelect={(index) => console.log('Select tab', index)}
                    />
                </main>

                <TerminalSidebar position="right" isOpen={isRightSidebarOpen} onToggle={() => setRightSidebarOpen(!isRightSidebarOpen)}
                    tabContent={<div className="flex w-12 flex-none">
                        <TerminalTabBar
                            className="w-12"
                            tabs={rightTabs}
                            activeTab={activeRightTab}
                            onTabChange={setActiveRightTab}
                            onToggle={() => setRightSidebarOpen(!isRightSidebarOpen)}
                            position="right">
                        </TerminalTabBar>
                    </div>}

                    mainContent={<div className="flex-1  overflow-auto">
                        <TerminalTabContent
                            activeTab={activeRightTab}
                            onItemClick={handleItemClick}>
                        </TerminalTabContent>
                    </div>}
                />
            </div>

            <TerminalFooter
                leftContent={<span>SYSTEM STATUS: ACTIVE</span>}
                rightContent={
                    <>
                        <span><TerminalUsageReport /></span>
                        <span className="ml-4">v2.0 ALPHA</span>
                    </>
                }
            />

        </TerminalContainer>
    );
};

export default Layout;