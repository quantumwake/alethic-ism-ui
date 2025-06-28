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
        const currentUsage = userUsageReport['total']
        const maxUnits = userProfile?.max_agentic_units || 1
        const usageRatio = currentUsage / maxUnits
        setUsageUnits(usageRatio)
    }, [userUsageReport]);

    return (
        <Tippy content="Agent Units (usage)">
            <span className={usageUnits > 1.0 ? 'text-red-600 animate-pulse mr-10' : 'text-white mr-10'}>
                ISM UNITS: {userUsageReport?.total || 0} / {userProfile?.max_agentic_units || 0}
            </span>
        </Tippy>
    )
}

export default TerminalUsageReport