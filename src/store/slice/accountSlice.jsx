// slices/accountSlice.js

export const useAccountSlice = (set, get) => ({
    jwtToken: null,

    setJwtToken: token => {
        set({ jwtToken: token })
        localStorage.setItem('jwtToken', token)
    },

    clearJwtToken: () => {
        set({ jwtToken: null })
        localStorage.removeItem('jwtToken')
    },

    userId: null,
    userProfile: null,
    setUserId: userId => set({ userId }),
    setUserProfile: profile => set({ userProfile: profile }),

    // POST /user/basic
    createUserProfileBasic: async userCreate => {
        try {
            const resp = await get().authPost('/user/basic', userCreate)
            if (!resp.ok) {
                // authPost already pushed an error into state.errors
                return null
            }
            const profile = await resp.json()
            get().setUserId(profile.user_id)
            get().setUserProfile(profile)

            // persist jwt to local browser store
            const jwtToken = resp.headers.get('Authorization').split(' ')[1];
            localStorage.setItem('jwtToken', jwtToken);
            set({ jwtToken });

            return profile
        } catch (err) {
            // network error also pushed into state.errors by authFetch
            return null
        }
    },

    createUserProfileGoogle: async userCreate => {
        try {
            const resp = await get().authPost('/user/google', userCreate)
            if (!resp.ok) {
                // authPost already pushed an error into state.errors
                return null
            }
            const profile = await resp.json()
            get().setUserId(profile.user_id)
            get().setUserProfile(profile)
            return resp
        } catch (err) {
            // network error also pushed into state.errors by authFetch
            return null
        }
    },

    // GET /user
    fetchUserProfile: async () => {
        try {
            const resp = await get().authGet('/user')
            if (resp.status === 404) {
                set({ userProfile: null })
                return null
            }
            if (!resp.ok) {
                return null
            }
            const profile = await resp.json()
            set({ userProfile: profile })
            return profile
        } catch (err) {
            return null
        }
    },
})

export default useAccountSlice


// export const useAccountSlice = (set, get) => ({
//     jwtToken: null,
//
//     // Set JWT token
//     setJwtToken: (token) => {
//         set({ jwtToken: token});
//         localStorage.setItem('jwtToken', token);
//         // localStorage.setItem('jwtToken', "testtoken");   // TODO NOTE: login bypass
//     },
//
//     // Clear JWT token (for logout)
//     clearJwtToken: () => {
//         set({ jwtToken: null});
//         localStorage.removeItem('jwtToken');
//     },
//
//     // user profile (create account, fetch user id by auth)
//     // userId: "77c17315-3013-5bb8-8c42-32c28618101f",  // TODO NOTE: login bypass
//     userId: null,
//     setUserId: (userId) => set({ userId: userId }),
//     userProfile: null,
//     setUserProfile: (userProfile) => set({userProfile: userProfile}),
//
//
//     // create user profile
//     createUserProfile: async(userDetails) => {
//
//         const response = await fetch(`${get().ISM_API_BASE_URL}/user`, {
//             method: 'POST',
//             credentials: 'include',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(userDetails),
//             redirect: 'follow', // Explicitly follow redirects
//         });
//
//         if (!response.ok) {
//             // TODO proper error handling -- throw new Error('Network response error when trying create or update user profile');
//         }
//
//         const userProfile = await response.json();
//
//         // assign the new user id
//         get().setUserId(userProfile['user_id'])
//         get().setUserProfile(userProfile)
//         return response
//     },
//
//     // TODO need to define these models as per openapi spec basically through all slices
//     // TODO also need to grossly simplify the handling of httpGet, httpPost, httpDelete, httpPut, as internal functions, its repeatedly so many times here.
//     createUserProfileBasic: async(userCreate) => {
//         const response = await fetch(`${get().ISM_API_BASE_URL}/user/basic`, {
//             method: 'POST',
//             credentials: 'include',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(userCreate),
//             redirect: 'follow',
//         })
//
//         if (!response.ok) {
//             // TODO proper error handling -- throw new Error('Network response error when trying create or update user profile');
//         }
//
//         const userProfile = await response.json();
//
//         // assign the new user id
//         get().setUserId(userProfile['user_id'])
//         get().setUserProfile(userProfile)
//         return response
//     },
//
//     // fetch user
//     fetchUserProfile: async () => {
//         const { authenticatedFetch } = get();
//         const response = await authenticatedFetch(`${get().ISM_API_BASE_URL}/user`, {
//             method: 'GET',
//             credentials: 'include',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${get().jwtToken}`,
//             },
//         });
//
//         if (response.ok) {
//             const userProfile = await response.json();
//             set({userProfile: userProfile})
//             return userProfile
//         }
//
//         if (response.status === 404) {
//             set({userProfile: null});
//         }
//         // TODO proper error handling -- throw new Error('Network response was not ok');
//     },
// });
//
// export default useAccountSlice
//
