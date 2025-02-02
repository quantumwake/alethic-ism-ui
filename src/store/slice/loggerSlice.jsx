export const useLoggerSlice = (set, get) => ({

    fetchMonitorLogEvents: async(projectId) => {
        if (!projectId)
            projectId = get().selectedProjectId

        const response = await fetch(`${get().ISM_API_BASE_URL}/monitor/project/${projectId}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${get().jwtToken}`,
            },
        });

        // TODO check to make sure it is a not found error
        if (response.status === 404) {
            return []
        } else if (!response.ok) {
            // TODO proper error handling -- throw new Error('Network response error when trying to fetch monitor log events')
        }

        return response.json()
    },

    fetchMonitorLogEventsByRouteId: async(routeId) => {
        const response = await fetch(`${get().ISM_API_BASE_URL}/monitor/route/${routeId}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${get().jwtToken}`,
            },
        });

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

