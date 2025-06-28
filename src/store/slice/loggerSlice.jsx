export const useLoggerSlice = (set, get) => ({

    fetchMonitorLogEvents: async(projectId) => {
        if (!projectId)
            projectId = get().selectedProjectId

        const response = await get().authPost(`/monitor/project/${projectId}`, {});

        // TODO check to make sure it is a not found error
        if (response.status === 404) {
            return []
        } else if (!response.ok) {
            // TODO proper error handling -- throw new Error('Network response error when trying to fetch monitor log events')
        }

        return response.json()
    },

    fetchMonitorLogEventsByRouteId: async(routeId) => {
        const response = await get().authPost(`/monitor/route/${routeId}`, {});

        // TODO check to make sure it is a not found error
        if (response.status === 404) {
            return []
        } else if (!response.ok) {
            // TODO proper error handling -- throw new Error('Network response error when trying to fetch monitor log events')
        }

        return response.json()
    },

});

export default useLoggerSlice

