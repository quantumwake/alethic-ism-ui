export const useStudioSlice = (set, get) => ({
    isStudioRefreshEnabled: false,
    setStudioIsRefreshEnabled: (isStudioRefreshEnabled) => {
        set({ isStudioRefreshEnabled: isStudioRefreshEnabled });
    },
});

export default useStudioSlice

