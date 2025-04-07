export const useAccountSlice = (set, get) => ({
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
    setUserId: (userId) => set({ userId: userId }),
    userProfile: null,
    setUserProfile: (userProfile) => set({userProfile: userProfile}),


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

        const userProfile = await response.json();

        // assign the new user id
        get().setUserId(userProfile['user_id'])
        get().setUserProfile(userProfile)
        return response
    },

    // TODO need to define these models as per openapi spec basically through all slices
    // TODO also need to grossly simplify the handling of httpGet, httpPost, httpDelete, httpPut, as internal functions, its repeatedly so many times here.
    createUserProfileBasic: async(userCreate) => {
        const response = await fetch(`${get().ISM_API_BASE_URL}/user/basic`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userCreate),
            redirect: 'follow',
        })

        if (!response.ok) {
            // TODO proper error handling -- throw new Error('Network response error when trying create or update user profile');
        }

        const userProfile = await response.json();

        // assign the new user id
        get().setUserId(userProfile['user_id'])
        get().setUserProfile(userProfile)
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

export default useAccountSlice

