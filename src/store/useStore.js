import {create} from 'zustand';
import {persist} from "zustand/middleware";
import {
    useThemeSlice,
    useAccountSlice,
    useProjectSlice,
    useChannelSlice,
    useUsageSlice,
    useTemplateSlice,
    useProcessorSlice,
    useProcessorProviderSlice,
    useWorkflowSlice,
    useProcessorStateSlice,
    useStateSlice,
    useWorkspaceSlice,
    useWorkflowExtendedSlice,
    useSessionSlice,
    useLoggerSlice,
    useFileSystemSlice,
    useNotificationSlice,

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

            ...useThemeSlice(set, get),
            ...useAccountSlice(set, get),
            ...useProjectSlice(set, get),
            ...useFileSystemSlice(set, get),
            ...useStateSlice(set, get),
            ...useTemplateSlice(set, get),
            ...useProcessorSlice(set, get),
            ...useProcessorStateSlice(set, get),
            ...useProcessorProviderSlice(set, get),
            ...useSessionSlice(set, get),
            ...useUsageSlice(set, get),
            ...useWorkflowSlice(set, get),
            ...useWorkflowExtendedSlice(set, get),
            ...useChannelSlice(set, get),
            ...useWorkspaceSlice(set, get),
            ...useLoggerSlice(set, get),
            ...useNotificationSlice(set, get),

        }),
        {
            name: 'user-id-storage', // unique name for the storage
            getStorage: () => localStorage, // specify localStorage
            partialize: (state) => ({ userId: state.userId }), // only persist the userId field
        }
    )
)

export default useStore
