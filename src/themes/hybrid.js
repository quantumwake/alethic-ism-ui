import edge from "./hybrid/components/edge";
import input from "./hybrid/components/input";
import toggle from "./hybrid/components/toggle";

export const hybrid = {
    bg: 'bg-black',
    text: 'text-green-500 text-xs',
    textMuted: 'text-green-700',
    textAccent: 'text-amber-400',
    glowColor: 'rgb(252, 211, 77)', // amber-300
    textSize: {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg'
    },
    spacing: {
        xs: 'p-1',
        sm: 'p-2',
        base: 'p-3',
        lg: 'p-4'
    },
    border: 'border-green-900',
    hover: 'hover:bg-green-950 hover:text-amber-300',
    files: {
        select: 'bg-green-900 text-amber-300',
    },
    input: input,
    icon: 'text-amber-500',
    font: 'font-["IBM_Plex_Mono"]',
    hoverMenu: {
        // the button or icon that you hover to open the menu
        trigger: 'text-amber-400 hover:bg-green-950 hover:text-amber-300',
        // the menu panel itself
        content: 'bg-black border-2 border-green-900 shadow-lg',
        // each top-level menu item
        item: 'text-green-400 hover:bg-green-950 hover:text-amber-300 focus:bg-green-950',
        // submenu container & items
        subItems: {
            // the submenu panel
            content: 'bg-black border border-green-900',
            // each submenu item
            item: 'text-green-400 hover:bg-green-950 hover:text-amber-300 focus:bg-green-900'
        }
    },
    effects: {
        enableScanlines: true,
        enableCrt: true,
        scanlineClass: 'relative before:pointer-events-none before:absolute before:inset-0 before:bg-scanline',
        crtClass: 'relative overflow-hidden before:absolute before:inset-0 before:pointer-events-none before:bg-crt'
    },
    default: {
        text: {
            primary: 'text-green-500',
            secondary: 'text-amber-400',
            muted: 'text-green-700',
            accent: 'text-amber-300'
        },
        icon: {
            size: {
                sm: 'w-4 h-4',
                base: 'w-5 h-5',
                lg: 'w-6 h-6'
            }
        },
    },
    button: {
        primary: 'bg-green-900 hover:bg-green-800 hover:text-amber-300 text-amber-400 border border-green-700 shadow-sm',
        secondary: 'bg-black hover:bg-green-950 hover:text-amber-300 text-green-400 border border-green-800',
        ghost: 'bg-transparent hover:bg-green-950 hover:text-amber-300 text-green-400 border border-green-900',
        danger: 'bg-black hover:bg-red-950 hover:text-red-300 text-red-400 border border-red-900',
        disabled: 'bg-black text-green-700 cursor-not-allowed border border-green-900',
    },
    dropdown: {
        trigger: 'bg-black hover:bg-green-950 hover:text-amber-300 text-green-400 border border-green-900',
        content: 'bg-black border border-green-900 shadow-lg',
        item: 'text-green-400 hover:bg-green-950 hover:text-amber-300 focus:bg-green-950',
        separator: 'bg-green-900',
        selected: 'bg-green-950 text-amber-300',
        active: 'bg-green-950 text-amber-400',
        disabled: 'bg-black text-green-700 cursor-not-allowed'
    },
    card: {
        base: 'bg-black border border-green-900 shadow-lg rounded-lg',
        header: 'border-b border-green-900 bg-green-950',
        content: 'bg-black',
        footer: 'border-t border-green-900 bg-green-950',
    },
    nodes: {
        state: {
            size: 'w-60 h-28',
            icon: 'text-amber-400',
            header: 'bg-green-900',
            headerText: 'text-amber-400'
        },
        processor: {
            size: 'w-60 h-28',
            icon: 'text-amber-400',
            header: 'bg-black',
            headerText: 'text-amber-400'
        }
    },
    edge: edge,
    toggle: toggle,
    tab: {
        section: {
            header: "bg-black",
            hover: "hover:bg-green-950"
        }
    },
    datatable: {
        header: "bg-black hover:bg-green-950 border-b border-r px-2 py-2 text-left text-amber-300",
    },
    checkbox: {
        base: 'border-green-700 bg-black',
        checked: 'bg-amber-600 border-amber-500',
        disabled: 'border-green-900 bg-black opacity-50',
        checkColor: '#ffffff',
        checkedBg: 'rgb(245, 158, 11)'
    }
}

export default hybrid