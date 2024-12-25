import extendTheme from "../extendedTheme";

export const createThemeSlice = (set, get) => ({
    activeTheme: 'matrix',  // default theme
    setActiveTheme: (activeTheme) => set({ activeTheme: activeTheme }),
    getCurrentTheme: () => extendTheme(get().activeTheme),
});

export default createThemeSlice
