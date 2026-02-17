import extendTheme from "../extendedTheme";

export const useThemeSlice = (set, get) => ({
    activeTheme: 'midnightlab',  // default theme
    setActiveTheme: (activeTheme) => set({ activeTheme: activeTheme }),
    getCurrentTheme: () => extendTheme(get().activeTheme),
});

export default useThemeSlice
