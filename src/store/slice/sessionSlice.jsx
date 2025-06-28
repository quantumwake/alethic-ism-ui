export const useSessionSlice = (set, get) => ({
    // create a new session used to hold relevant information (mainly for chat dialogue)
    createSession: async() => {
        const response = await get().authPost('/session/create', {});

        if (!response.ok) {
            // TODO proper error handling -- throw new Error('network response error when trying create new session');
        }

        const data = await response.json();
        return data['session_id']
    },

});

export default useSessionSlice

