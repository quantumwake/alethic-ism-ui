import React, {useState} from "react";
import {
    LayoutGrid,
} from 'lucide-react'

import {
    TerminalContainer,
    TerminalHeader,
    TerminalFooter
} from "./components/common"

import {useStore} from "./store"
import {TerminalSyslog, TerminalUserMenu} from "./components/ism"
import {Outlet} from "react-router-dom";

const LayoutBasic = ({}) => {
    const {setActiveTheme} = useStore()

    return (
        <TerminalContainer className="h-screen flex flex-col">
            <TerminalHeader
                leftContent={<>
                    <LayoutGrid className="w-4 h-4" />
                    <span>Instruction State Machine (ISM)</span>
                </>}
                rightContent={<></>}>
            </TerminalHeader>

            <main className="flex-1 p-0 overflow-auto">
                <Outlet />
            </main>

            <TerminalFooter
                leftContent={<span>SYSTEM STATUS: ACTIVE</span>}
                rightContent={
                    <>
                        <span className="ml-4">v2.0 ALPHA</span>
                    </>
                }
            />

        </TerminalContainer>
    );
};

export default LayoutBasic;