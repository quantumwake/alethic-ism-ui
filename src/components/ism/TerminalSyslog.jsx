import {useStore} from "../../store";
import React, {memo, useEffect, useRef, useState} from "react";
import {TerminalDialog, TerminalDataTable2} from "../common";
import {BellIcon} from "lucide-react";

function TerminalSyslog({routeId, buttonClass}) {

    // global state
    const theme = useStore(state => state.getCurrentTheme());
    const { selectedProjectId, fetchMonitorLogEvents, fetchMonitorLogEventsByRouteId} = useStore();

    // local states
    const menuRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    useEffect(() => {
        const getData = async () => {
            setLoading(true);
            setError(null);
            try {
                let result = []
                if (routeId) {
                    result = await fetchMonitorLogEventsByRouteId(routeId)
                } else {
                    result = await fetchMonitorLogEvents(selectedProjectId);
                }
                setData(result);
            } catch (error) {
                setError(error.message);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) getData().then(() => {
            console.debug("fetched: project system event logs")
        })
    }, [isOpen, selectedProjectId, fetchMonitorLogEvents]);

    const columns = {
        log_id: { name: "Id" },
        log_type: { name: "Event" },
        log_time: { name: "Time" },
        exception: { name: "Exception" },
        data: { name: "Data" }
    };

    const toggleDialog = () => {
        setIsOpen(false)
    };

    return (
        <div ref={menuRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={buttonClass === "" ? `p-1 rounded ${theme.hover} flex items-center gap-2` : buttonClass}>
                <BellIcon className={`w-4 h-4`} />
            </button>

            <TerminalDataTable2
                isOpen={isOpen}
                onClose={() => toggleDialog()}
                table={data}
                columns={columns}
                className="w-full"
            />
        </div>
    )
}

export default memo(TerminalSyslog);