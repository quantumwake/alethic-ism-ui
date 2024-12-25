export const createAccountSlice = (set, get) => ({
    jwtToken: null,

    // Set JWT token
    setJwtToken: (token) => {
        set({ jwtToken: token});
        localStorage.setItem('jwtToken', token);
        // localStorage.setItem('jwtToken', "testtoken");   // TODO NOTE: login bypass
    },

    // Clear JWT token (for logout)
    clearJwtToken: () => {
        set({ jwtToken: null});
        localStorage.removeItem('jwtToken');
    },

    // user profile (create account, fetch user id by auth)
    // userId: "77c17315-3013-5bb8-8c42-32c28618101f",  // TODO NOTE: login bypass
    userId: null,
    userProfile: null,
    setUserId: (userId) => set({ userId: userId }),


    // create user profile
    createUserProfile: async(userDetails) => {

        const response = await fetch(`${get().ISM_API_BASE_URL}/user`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userDetails),
            redirect: 'follow', // Explicitly follow redirects
        });

        if (!response.ok) {
            // TODO proper error handling -- throw new Error('Network response error when trying create or update user profile');
        }

        const data = await response.json();

        // assign the new user id
        get().setUserId(data['user_id'])
        return response
    },

    // fetch user
    fetchUserProfile: async () => {
        const { authenticatedFetch } = get();
        const response = await authenticatedFetch(`${get().ISM_API_BASE_URL}/user`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${get().jwtToken}`,
            },
        });

        if (response.ok) {
            const userProfile = await response.json();
            set({userProfile: userProfile})
            return userProfile
        }

        if (response.status === 404) {
            set({userProfile: null});
        }
        // TODO proper error handling -- throw new Error('Network response was not ok');
    },
});

export default createAccountSlice

