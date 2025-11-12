import edge from "./cyber/components/edge";
import input from "./cyber/components/input";
import toggle from "./cyber/components/toggle";

export const cyber = {
    bg: 'bg-gray-900',
    text: 'text-cyan-300 text-xs',
    textMuted: 'text-cyan-700',
    textAccent: 'text-cyan-400',
    glowColor: 'rgb(34, 211, 238)', // cyan-400
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
    border: 'border-cyan-900',
    hover: 'hover:bg-cyan-900 hover:text-blue-300',
    files: {
        select: 'bg-cyan-900 text-blue-300',
    },
    input: input,
    icon: 'text-cyan-500',
    font: 'font-["IBM_Plex_Mono"]',
    hoverMenu: {
        trigger: 'text-cyan-300 hover:bg-blue-900 hover:text-blue-300',
        content: 'bg-gray-900 border-2 border-cyan-950 shadow-lg',
        item: 'text-cyan-300 hover:bg-blue-900 hover:text-blue-300 focus:bg-cyan-900',
        subItems: {
            content: 'bg-gray-900 border border-cyan-900',
            item: 'text-cyan-300 hover:bg-blue-900 hover:text-blue-300 focus:bg-cyan-800'
        }
    },
    effects: {
        enableScanlines: false,
        enableCrt: false,
        scanlineClass: '',
        crtClass: ''
    },
    default: {
        text: {
            primary: 'text-cyan-500',
            secondary: 'text-cyan-400',
            muted: 'text-cyan-700',
            accent: 'text-cyan-300'
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
        primary: 'bg-cyan-900 hover:bg-blue-900 hover:text-blue-300 text-cyan-300 border border-cyan-700 shadow-inner shadow-cyan-950',
        secondary: 'bg-cyan-950 hover:bg-blue-900 hover:text-blue-300 text-cyan-400 border border-cyan-800',
        ghost: 'bg-transparent hover:bg-blue-900 hover:text-blue-300 text-cyan-500 border border-cyan-900',
        danger: 'bg-red-950 hover:bg-blue-900 hover:text-blue-300 text-red-400 border border-red-800',
        disabled: 'bg-cyan-950 text-cyan-800 cursor-not-allowed border border-cyan-900',
    },
    dropdown: {
        trigger: 'bg-gray-900 hover:bg-blue-900 hover:text-blue-300 text-cyan-500 border border-cyan-900',
        content: 'bg-gray-900 border border-cyan-900 shadow-lg',
        item: 'text-cyan-500 hover:bg-blue-900 hover:text-blue-300 focus:bg-cyan-900',
        separator: 'bg-cyan-900',
        selected: 'bg-cyan-900 text-cyan-300',
        active: 'bg-cyan-950 text-cyan-400',
        disabled: 'bg-cyan-950 text-cyan-800 cursor-not-allowed'
    },
    card: {
        base: 'bg-gray-900 border border-cyan-900 shadow-lg rounded-lg',
        header: 'border-b border-cyan-900 bg-cyan-950',
        content: 'bg-gray-900',
        footer: 'border-t border-cyan-900 bg-cyan-950',
    },
    nodes: {
        state: {
            size: 'w-60 h-28',
            icon: 'text-blue-300',
            header: 'bg-blue-950',
            headerText: 'text-blue-300'
        },
        processor: {
            size: 'w-60 h-28',
            icon: 'text-blue-300',
            header: 'bg-cyan-950',
            headerText: 'text-blue-300'
        }
    },
    edge: edge,
    toggle: toggle,
    tab: {
        section: {
            header: "bg-cyan-950",
            hover: "hover:bg-blue-950"
        }
    },
    datatable: {
        header: "bg-cyan-950 hover:bg-cyan-800 border-b border-r px-2 py-2 text-left text-cyan-200",
    },
    checkbox: {
        base: 'border-cyan-700 bg-gray-900',
        checked: 'bg-cyan-600 border-cyan-500',
        disabled: 'border-cyan-900 bg-cyan-950 opacity-50',
        checkColor: '#ffffff',
        checkedBg: 'rgb(8, 145, 178)'
    },
    usageReport: {
        tooltip: {
            bg: 'bg-gray-900',
            border: 'border-cyan-500/30',
            headerText: 'from-cyan-400 to-blue-500',
            badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        },
        card: {
            bg: 'bg-gray-800/50',
            border: 'border-gray-700/50',
            hoverBorder: 'hover:border-cyan-500/30',
            titleText: 'text-cyan-400',
            labelText: 'text-gray-400',
            dotColor: 'bg-cyan-400',
        }
    }
}

export default cyber
