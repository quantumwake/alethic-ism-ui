import edge from "./light/components/edge";
import input from "./light/components/input";
import toggle from "./light/components/toggle";

export const light = {
    bg: 'bg-white',
    text: 'text-slate-900 text-xs',
    textMuted: 'text-slate-500',
    textAccent: 'text-blue-600',
    glowColor: 'rgb(37, 99, 235)', // blue-600
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
    border: 'border-slate-200',
    hover: 'hover:bg-slate-100 hover:text-slate-900',
    files: {
        select: 'bg-blue-100 text-blue-700',
    },
    input: input,
    icon: 'text-slate-600',
    font: 'font-["Inter"]',
    hoverMenu: {
        // the button or icon that you hover to open the menu
        trigger: 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
        // the menu panel itself
        content: 'bg-white border-2 border-slate-200 shadow-lg',
        // each top-level menu item
        item: 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100',
        // submenu container & items
        subItems: {
            // the submenu panel
            content: 'bg-white border border-slate-200',
            // each submenu item
            item: 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100'
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
            primary: 'text-slate-900',
            secondary: 'text-slate-700',
            muted: 'text-slate-500',
            accent: 'text-blue-600'
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
        primary: 'bg-blue-500 hover:bg-blue-600 text-white border border-blue-600 shadow-sm',
        secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300',
        ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 border border-transparent',
        danger: 'bg-red-500 hover:bg-red-600 text-white border border-red-600',
        disabled: 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200',
    },
    dropdown: {
        trigger: 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300',
        content: 'bg-white border border-slate-200 shadow-lg',
        item: 'text-slate-700 hover:bg-slate-100 focus:bg-slate-100',
        separator: 'bg-slate-200',
        selected: 'bg-blue-100 text-blue-700',
        active: 'bg-slate-100 text-slate-900',
        disabled: 'bg-white text-slate-400 cursor-not-allowed'
    },
    card: {
        base: 'bg-white border border-slate-200 shadow-sm rounded-lg',
        header: 'border-b border-slate-200 bg-slate-50',
        content: 'bg-white',
        footer: 'border-t border-slate-200 bg-slate-50',
    },
    nodes: {
        state: {
            size: 'w-60 h-28',
            icon: 'text-blue-600',
            header: 'bg-blue-100',
            headerText: 'text-blue-700'
        },
        processor: {
            size: 'w-60 h-28',
            icon: 'text-slate-600',
            header: 'bg-slate-100',
            headerText: 'text-slate-700'
        }
    },
    edge: edge,
    toggle: toggle,
    tab: {
        section: {
            header: "bg-slate-100",
            hover: "hover:bg-slate-200"
        }
    },
    datatable: {
        header: "bg-slate-100 hover:bg-slate-200 border-b border-r px-2 py-2 text-left text-slate-700",
    }
}

export default light