export const useUsageSlice = (set, get) => ({

    // usage reports
    userUsageReport: {},
    setUserUsageReport: (userUsageReport) => set({ userUsageReport: userUsageReport }),

    // usage reports
    chartsUsageReport: [],
    setChartsUsageReport: (chartsUsageReport) => set({ chartsUsageReport: chartsUsageReport }),

    projectUsageReport: {},
    setProjectUsageReport: (projectUsageReport) => set({ projectUsageReport: projectUsageReport }),

    fetchUsageReportByUser: async() => {
        const response = await get().authGet(`/usage/user/percentages`);
        let usage = null

        // TODO check to make sure it is a not found error
        if (!response.ok) {
            console.error('Network response error when trying to fetch usage report')
        } else {
            usage = await response.json()
        }

        get().setUserUsageReport(usage)
        return usage
    },

    fetchUsageReportByProject: async() => {
        const project_id = get().selectedProjectId
        if (!project_id) {
            return null
        }
        const response = await get().authGet(`/usage/project/${project_id}/percentages`);
        let usage = null

        // TODO check to make sure it is a not found error
        if (!response.ok) {
            console.error('Network response error when trying to fetch usage report')
        } else {
            usage = await response.json()
        }

        get().setProjectUsageReport(usage)
        return usage
    },
    //
    // fetchUsageReportGroupForCharts: async() => {
    //     const user_id = get().userId
    //     const response = await get().authGet(`/usage/user/${user_id}/charts`);
    //     let usage = []
    //     // TODO check to make sure it is a not found error
    //     if (!response.ok) {
    //         console.error('Network response error when trying to fetch usage report')
    //     } else {
    //         usage = await response.json()
    //     }
    //
    //     get().setChartsUsageReport(usage)
    //     return usage
    // },
});

export default useUsageSlice

