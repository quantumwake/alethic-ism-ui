// Helper function to extend theme with additional properties
import themes from "./index";

const extendTheme = (themeName) => {
    const baseTheme = themes[themeName];
    return {
        ...baseTheme,
        // Add complementary classes that can be used for enhanced components
        card: `${baseTheme.bg} shadow-sm`,
        selected: `bg-opacity-10 ${baseTheme.textAccent}`,
        button: {
            primary: `${baseTheme.textAccent} bg-opacity-10 ${baseTheme.hover}`,
            secondary: `${baseTheme.text} ${baseTheme.hover} bg-opacity-5`,
        },
        divider: baseTheme.border,
    }
};

export default extendTheme;