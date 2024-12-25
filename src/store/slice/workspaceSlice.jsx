import extendTheme from "../extendedTheme";

export const createWorkspaceSlice = (set, get) => ({

    currentWorkspace: "studio",
    setCurrentWorkspace: (currentWorkspace) => set( { currentWorkspace: currentWorkspace }),

});

export default createWorkspaceSlice
