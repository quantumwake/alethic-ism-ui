export const createSessionSlice = (set, get) => ({
    // create a new session used to hold relevant information (mainly for chat dialogue)
    createSession: async() => {
        const { authenticatedFetch } = get();
        const response = await authenticatedFetch(`${get().ISM_API_BASE_URL}/session/create`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            redirect: 'follow', // Explicitly follow redirects
        });

        if (!response.ok) {
            // TODO proper error handling -- throw new Error('network response error when trying create new session');
        }

        const data = await response.json();
        return data['session_id']
    },

});

export default createSessionSlice

