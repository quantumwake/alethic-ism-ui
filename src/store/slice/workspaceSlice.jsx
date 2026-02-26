export const useWorkspaceSlice = (set, get) => ({
    currentWorkspace: "home",
    setCurrentWorkspace: (currentWorkspace) => set( { currentWorkspace: currentWorkspace }),
});

export default useWorkspaceSlice
