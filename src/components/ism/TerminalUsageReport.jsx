import {useStore} from "../../store";
import {useEffect, useState} from "react";
import Tippy from "@tippyjs/react";

function TerminalUsageReport() {
    const {jwtToken} = useStore()
    const {userProfile} = useStore()
    const {userUsageReport, fetchUsageReportGroupByUser} = useStore()
    const [isUsageRefreshing, setIsUsageRefreshing] = useState(true)
    const [usageTimeoutId, setUsageTimeoutId] = useState(null | undefined)
    const [usageUnits, setUsageUnits] = useState(0)

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

    useEffect(() => {
        if (!userUsageReport) {
            return "Pending"
        }
        const units = userUsageReport['total'] / userProfile?.max_agentic_units
        setUsageUnits(units)
    }, [userUsageReport]);

    return (
        <Tippy content="Agent Units (usage)">
            <span className={usageUnits > 1.0 ? 'text-red-600 animate-fade-in-out mr-10' : 'text-white mr-10'}>
                ISM UNITS: {usageUnits}
            </span>
        </Tippy>
    )
}

export default TerminalUsageReport