import {useStore} from "../../store";
import {useEffect, useState} from "react";
import Tippy from "@tippyjs/react";


const formatPct = (value) => {
    if (value === null || value === undefined) return 'N/A'
    return `${value.toFixed(1)}%`
}

const formatCost = (value) => {
    if (value === null || value === undefined) return 'N/A'
    return `$${value.toFixed(2)}`
}

function TerminalUsageReportCard({period, pct_tokens_used, pct_cost_used, cost_used, className}) {
    const {getCurrentTheme} = useStore()
    const theme = getCurrentTheme()

    const getUsageClass = (value) => {
        if (value === null || value === undefined) return 'text-gray-400'
        if (value >= 95) return 'text-red-600 font-bold'
        if (value >= 90) return 'text-red-500'
        if (value >= 75) return 'text-yellow-500'
        if (value >= 50) return 'text-green-500'
        return 'text-green-400'
    }

    return (
        <div className={`${theme?.usageReport?.card?.bg} p-1.5 border ${theme?.usageReport?.card?.border} ${theme?.usageReport?.card?.hoverBorder} transition-all flex flex-col min-h-[55px] ${className || ''}`}>
            <div className={`font-bold ${theme?.usageReport?.card?.titleText} mb-1 flex items-center whitespace-nowrap`}>
                {/*<span className={`w-1 h-1 ${theme?.usageReport?.card?.dotColor} mr-1 flex-shrink-0`}></span>*/}
                <span className="truncate uppercase">{period}</span>
            </div>
            <div className="space-y-0.5 flex-1">
                <div className="flex justify-between">
                    <span className={theme?.usageReport?.card?.labelText}>Token Limit %:</span>
                    <span className={`font-semibold ${getUsageClass(pct_tokens_used)}`}>{formatPct(pct_tokens_used)}</span>
                </div>
                <div className="flex justify-between">
                    <span className={theme?.usageReport?.card?.labelText}>Cost Limit %:</span>
                    <span className={`font-semibold ${getUsageClass(pct_cost_used)}`}>{formatPct(pct_cost_used)}</span>
                </div>
                <div className="flex justify-between">
                    <span className={theme?.usageReport?.card?.labelText}>Cost:</span>
                    <span className={`font-semibold`}>{formatCost(cost_used)}</span>
                </div>
            </div>
        </div>
    )
}

function TerminalUsageReport() {
    const {jwtToken} = useStore()
    const {userProfile} = useStore()
    const {userUsageReport, fetchUsageReportByUser} = useStore()
    const {projectUsageReport, fetchUsageReportByProject} = useStore()
    const {getCurrentTheme} = useStore()
    const theme = getCurrentTheme()
    const [isUsageRefreshing, setIsUsageRefreshing] = useState(true)
    const [usageTimeoutId, setUsageTimeoutId] = useState(null | undefined)
    const [usageUnits, setUsageUnits] = useState(0)

    const refreshUsage = async () => {
        if (usageTimeoutId) {
            clearTimeout(usageTimeoutId)
        }

        if (isUsageRefreshing) {
            console.info('updating user usage units')
            await fetchUsageReportByUser()

            console.info('updating project usage units')
            await fetchUsageReportByProject()

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
            return
        }
        // Calculate max usage percentage across all metrics
        const percentages = [
            userUsageReport.pct_minute_tokens_used,
            userUsageReport.pct_minute_cost_used,
            userUsageReport.pct_hour_tokens_used,
            userUsageReport.pct_hour_cost_used,
            userUsageReport.pct_day_tokens_used,
            userUsageReport.pct_day_cost_used,
            userUsageReport.pct_month_tokens_used,
            userUsageReport.pct_month_cost_used,
            userUsageReport.pct_year_tokens_used,
            userUsageReport.pct_year_cost_used
        ].filter(val => val !== null && val !== undefined)

        const maxPct = percentages.length > 0 ? Math.max(...percentages) : 0
        setUsageUnits(maxPct / 100) // Convert to 0-1 range for threshold check
    }, [userUsageReport]);



    const getMetricStyle = (tokenPct, costPct) => {
        const maxPct = Math.max(
            tokenPct !== null && tokenPct !== undefined ? tokenPct : 0,
            costPct !== null && costPct !== undefined ? costPct : 0
        )

        if (maxPct > 95) {
            return 'text-red-600 font-bold animate-pulse-fast'
        } else if (maxPct >= 90) {
            return 'text-red-500 font-bold'
        } else if (maxPct >= 75) {
            return 'text-yellow-500'
        } else if (maxPct >= 50) {
            return 'text-green-500'
        } else if (maxPct >= 40) {
            return 'text-green-400'
        } else if (maxPct >= 20) {
            return 'text-green-300'
        } else if (maxPct >= 10) {
            return 'text-green-200'
        } else {
            return 'text-white'
        }
    }

    const tierDisplay = userProfile?.tier_id ? userProfile.tier_id.toUpperCase() : 'N/A'

    return (
        <>
            <style>{`
                @keyframes pulse-fast {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
                .animate-pulse-fast {
                    animation: pulse-fast 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
            <Tippy
                interactive={true}
                content={
                <div className={`${theme?.usageReport?.tooltip?.bg} p-2 shadow-2xl border ${theme?.usageReport?.tooltip?.border} w-[420px] max-w-[420px]`}>
                    <div className={`mb-2 ${theme?.usageReport?.tooltip?.headerText} border-b ${theme?.usageReport?.tooltip?.border} pb-2 flex items-center justify-between`}>
                        <span>ISM Usage Report</span>
                        <span className={`${theme?.usageReport?.tooltip?.badge} px-2 py-0.5 border`}>{tierDisplay}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">

                        <TerminalUsageReportCard period="year" pct_tokens_used={userUsageReport?.pct_year_tokens_used}
                                                 pct_cost_used={userUsageReport?.pct_year_cost_used}
                                                 cost_used={userUsageReport?.cur_year_total_cost} />

                        <TerminalUsageReportCard period="month" pct_tokens_used={userUsageReport?.pct_month_tokens_used}
                                                 pct_cost_used={userUsageReport?.pct_month_cost_used}
                                                 cost_used={userUsageReport?.cur_month_total_cost} />

                        <TerminalUsageReportCard period="day" pct_tokens_used={userUsageReport?.pct_day_tokens_used}
                                                 pct_cost_used={userUsageReport?.pct_day_cost_used}
                                                 cost_used={userUsageReport?.cur_day_total_cost} />

                        <TerminalUsageReportCard period="hour" pct_tokens_used={userUsageReport?.pct_hour_tokens_used}
                                                 pct_cost_used={userUsageReport?.pct_hour_cost_used}
                                                 cost_used={userUsageReport?.cur_hour_total_cost} />

                        <TerminalUsageReportCard period="minute" pct_tokens_used={userUsageReport?.pct_minute_tokens_used}
                                                 pct_cost_used={userUsageReport?.pct_minute_cost_used}
                                                 cost_used={userUsageReport?.cur_minute_total_cost} />

                        <TerminalUsageReportCard period="project" pct_tokens_used={userUsageReport?.pct_year_tokens_used}
                                                 pct_cost_used={projectUsageReport?.pct_year_cost_used}
                                                 cost_used={projectUsageReport?.cur_year_total_cost}
                                                 className="!border-blue-500" />

                    </div>
                </div>
            }>
                <span className="mr-10 cursor-pointer">
                    <span className="text-white">[{tierDisplay}]</span>
                    {' '}

                    <span className={getMetricStyle(userUsageReport?.pct_minute_tokens_used, userUsageReport?.pct_minute_cost_used)}>
                        MIN: {formatCost(userUsageReport?.cur_minute_total_cost)} ({formatPct(userUsageReport?.pct_minute_tokens_used)}/{formatPct(userUsageReport?.pct_minute_cost_used)})
                    </span>

                    {' | '}

                    <span className={getMetricStyle(userUsageReport?.pct_hour_tokens_used, userUsageReport?.pct_hour_cost_used)}>
                        HR: {formatPct(userUsageReport?.pct_hour_tokens_used)}/{formatPct(userUsageReport?.pct_hour_cost_used)}
                    </span>

                    {' | '}

                    <span className={getMetricStyle(userUsageReport?.pct_day_tokens_used, userUsageReport?.pct_day_cost_used)}>
                        DAY: {formatPct(userUsageReport?.pct_day_tokens_used)}/{formatPct(userUsageReport?.pct_day_cost_used)}
                    </span>

                    {' | '}

                    {/*<span className={getMetricStyle(userUsageReport?.pct_month_tokens_used, userUsageReport?.pct_month_cost_used)}>*/}
                    {/*    MO: {formatPct(userUsageReport?.pct_month_tokens_used)}/{formatPct(userUsageReport?.pct_month_cost_used)}*/}
                    {/*</span>*/}

                    {/*{' | '}*/}

                    {/*<span className={getMetricStyle(userUsageReport?.pct_year_tokens_used, userUsageReport?.pct_year_cost_used)}>*/}
                    {/*    YR: {formatPct(userUsageReport?.pct_year_tokens_used)}/{formatPct(userUsageReport?.pct_year_cost_used)}*/}
                    {/*</span>*/}
                </span>
            </Tippy>
        </>
    )
}

export default TerminalUsageReport