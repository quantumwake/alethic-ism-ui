export const useWorkspaceSlice = (set, get) => ({
    currentWorkspace: "studio",
    setCurrentWorkspace: (currentWorkspace) => set( { currentWorkspace: currentWorkspace }),
});

export default useWorkspaceSlice
