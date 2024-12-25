import {create} from 'zustand';
import {persist} from "zustand/middleware";
import {
    createThemeSlice,
    createAccountSlice,
    createProjectSlice,
    createChannelSlice,
    createUsageSlice,
    createTemplateSlice,
    createProcessorSlice,
    createProcessorProviderSlice,
    createWorkflowSlice,
    createProcessorStateSlice,
    createStateSlice,
    createWorkspaceSlice,
    createWorkflowExtendedSlice,
    createSessionSlice,
    createLoggerSlice,
} from "./slice";

import {authFetch} from "."

const useStore = create(
    persist
    (
        (set, get) => ({
            arrayToMap: (array) => {
                return array.reduce((map, obj) => {
                    map[obj.name] = obj;
                    return map;
                }, {});
            },
            mapToArray: (map) => {
                return Object.values(map);
            },

            // Authenticated fetch function
            authenticatedFetch: authFetch(set, get),

            // general environment variables required by apis and other resources.
            ENVIRONMENT: window.env.REACT_APP_ENVIRONMENT,
            ISM_API_BASE_URL: window.env.REACT_APP_ISM_API_BASE_URL,

            ...createThemeSlice(set, get),
            ...createAccountSlice(set, get),
            ...createProjectSlice(set, get),
            ...createStateSlice(set, get),
            ...createTemplateSlice(set, get),
            ...createProcessorSlice(set, get),
            ...createProcessorStateSlice(set, get),
            ...createProcessorProviderSlice(set, get),
            ...createSessionSlice(set, get),
            ...createUsageSlice(set, get),
            ...createWorkflowSlice(set, get),
            ...createWorkflowExtendedSlice(set, get),
            ...createChannelSlice(set, get),
            ...createWorkspaceSlice(set, get),
            ...createLoggerSlice(set, get),

        }),
        {
            name: 'user-id-storage', // unique name for the storage
            getStorage: () => localStorage, // specify localStorage
            partialize: (state) => ({ userId: state.userId }), // only persist the userId field
        }
    )
)

export default useStore
