import edge from "./matrix/components/edge";
import input from "./matrix/components/input";
import toggle from "./matrix/components/toggle";

export const matrix= {
    bg: 'bg-black',
    text: 'text-green-500 text-xs',
    textMuted: 'text-green-700',
    textAccent: 'text-green-400',
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
    hover: 'hover:bg-green-900 hover:text-amber-300',
    input: input,
    icon: 'text-green-500',
    font: 'font-["IBM_Plex_Mono"]',
    effects: {
        enableScanlines: true,
        enableCrt: true,
        scanlineClass: 'relative before:pointer-events-none before:absolute before:inset-0 before:bg-scanline',
        crtClass: 'relative rounded-md overflow-hidden before:absolute before:inset-0 before:pointer-events-none before:bg-crt'
    },
    default: {
        text: {
            primary: 'text-green-500',
            secondary: 'text-green-400',
            muted: 'text-green-700',
            accent: 'text-green-300'
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
        primary: 'bg-green-900 hover:bg-amber-900 hover:text-amber-300 text-green-300 border border-green-700 shadow-inner shadow-green-950',
        secondary: 'bg-green-950 hover:bg-amber-900 hover:text-amber-300 text-green-400 border border-green-800',
        ghost: 'bg-transparent hover:bg-amber-900 hover:text-amber-300 text-green-500 border border-green-900',
        danger: 'bg-red-950 hover:bg-amber-900 hover:text-amber-300 text-red-400 border border-red-800',
        disabled: 'bg-green-950 text-green-800 cursor-not-allowed border border-green-900',
    },
    dropdown: {
        trigger: 'bg-black hover:bg-amber-900 hover:text-amber-300 text-green-500 border border-green-900',
        content: 'bg-black border border-green-900 shadow-lg',
        item: 'text-green-500 hover:bg-amber-900 hover:text-amber-300 focus:bg-green-900',
        separator: 'bg-green-900',
        selected: 'bg-green-900 text-green-300',
        active: 'bg-green-950 text-green-400',
        disabled: 'bg-green-950 text-green-800 cursor-not-allowed'
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
            icon: 'text-amber-300',
            header: 'bg-amber-950',
            headerText: 'text-amber-300'
        },
        processor: {
            size: 'w-60 h-28',
            icon: 'text-amber-300',
            header: 'bg-green-950',
            headerText: 'text-amber-300'
        }
    },
    edge: edge,
    toggle: toggle,
    tab: {
        section: {
            header: "bg-green-950",
            hover: "hover:bg-amber-950"
        }
    },
    datatable: {
        header: "bg-green-950 hover:bg-green-800 border-b border-r px-2 py-2 text-left text-green-200",
    }
}

export default matrix