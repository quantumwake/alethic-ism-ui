import edge from "./amber/components/edge";
import input from "./amber/components/input";
import toggle from "./amber/components/toggle";

export const amber= {
    bg: 'bg-black',
    text: 'text-amber-500 text-xs',
    textMuted: 'text-amber-700',
    textAccent: 'text-amber-400',
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
    border: 'border-amber-900',
    hover: 'hover:bg-amber-950 hover:text-amber-300',
    files: {
        select: 'bg-amber-900 text-amber-300',
    },
    input: input,
    icon: 'text-amber-500',
    font: 'font-["VT323"]',
    hoverMenu: {
        // the button or icon that you hover to open the menu
        trigger: 'text-amber-300 hover:bg-amber-900 hover:text-amber-200',
        // the menu panel itself
        content: 'bg-black border-2 border-amber-950 shadow-lg',
        // each top-level menu item
        item: 'text-amber-300 hover:bg-amber-900 hover:text-amber-200 focus:bg-amber-900',
        // submenu container & items
        subItems: {
            // the submenu panel
            content: 'bg-black border border-amber-900',
            // each submenu item
            item: 'text-amber-300 hover:bg-amber-900 hover:text-amber-200 focus:bg-amber-800'
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
            primary: 'text-amber-500',
            secondary: 'text-amber-400',
            muted: 'text-amber-700',
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
        primary: 'bg-amber-900 hover:bg-amber-800 hover:text-amber-200 text-amber-300 border border-amber-700 shadow-inner shadow-amber-950',
        secondary: 'bg-amber-950 hover:bg-amber-800 hover:text-amber-200 text-amber-400 border border-amber-800',
        ghost: 'bg-transparent hover:bg-amber-900 hover:text-amber-200 text-amber-500 border border-amber-900',
        danger: 'bg-red-950 hover:bg-red-900 hover:text-amber-200 text-red-400 border border-red-800',
        disabled: 'bg-amber-950 text-amber-800 cursor-not-allowed border border-amber-900',
    },
    dropdown: {
        trigger: 'bg-black hover:bg-amber-900 hover:text-amber-200 text-amber-500 border border-amber-900',
        content: 'bg-black border border-amber-900 shadow-lg',
        item: 'text-amber-500 hover:bg-amber-900 hover:text-amber-200 focus:bg-amber-900',
        separator: 'bg-amber-900',
        selected: 'bg-amber-900 text-amber-300',
        active: 'bg-amber-950 text-amber-400',
        disabled: 'bg-amber-950 text-amber-800 cursor-not-allowed'
    },
    card: {
        base: 'bg-black border border-amber-900 shadow-lg rounded-lg',
        header: 'border-b border-amber-900 bg-amber-950',
        content: 'bg-black',
        footer: 'border-t border-amber-900 bg-amber-950',
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
            header: 'bg-amber-950',
            headerText: 'text-amber-300'
        }
    },
    edge: edge,
    toggle: toggle,
    tab: {
        section: {
            header: "bg-amber-950",
            hover: "hover:bg-amber-800"
        }
    },
    datatable: {
        header: "bg-amber-950 hover:bg-amber-800 border-b border-r px-2 py-2 text-left text-amber-200",
    }
}

export default amber;