import edge from "./crimson/components/edge";
import input from "./crimson/components/input";
import toggle from "./crimson/components/toggle";

export const crimson = {
    bg: 'bg-gray-950',
    text: 'text-rose-200 text-xs',
    textMuted: 'text-rose-400',
    textAccent: 'text-rose-100',
    glowColor: 'rgb(255, 228, 230)', // rose-100
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
    border: 'border-rose-900',
    hover: 'hover:bg-gray-900 hover:text-rose-100',
    files: {
        select: 'bg-rose-950 text-rose-100',
    },
    input: input,
    icon: 'text-rose-300',
    font: 'font-["Inter"]',
    hoverMenu: {
        // the button or icon that you hover to open the menu
        trigger: 'text-rose-200 hover:bg-gray-900 hover:text-rose-100',
        // the menu panel itself
        content: 'bg-gray-950 border-2 border-rose-900 shadow-lg',
        // each top-level menu item
        item: 'text-rose-200 hover:bg-gray-900 hover:text-rose-100 focus:bg-gray-900',
        // submenu container & items
        subItems: {
            // the submenu panel
            content: 'bg-gray-950 border border-rose-900',
            // each submenu item
            item: 'text-rose-200 hover:bg-gray-900 hover:text-rose-100 focus:bg-gray-900'
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
            primary: 'text-rose-200',
            secondary: 'text-rose-300',
            muted: 'text-rose-400',
            accent: 'text-rose-100'
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
        primary: 'bg-rose-900 hover:bg-rose-800 hover:text-rose-100 text-rose-100 border border-rose-800 shadow-sm',
        secondary: 'bg-gray-900 hover:bg-gray-800 hover:text-rose-100 text-rose-200 border border-rose-900',
        ghost: 'bg-transparent hover:bg-gray-900 hover:text-rose-100 text-rose-200 border border-rose-900',
        danger: 'bg-red-900 hover:bg-red-800 hover:text-white text-rose-100 border border-red-800',
        disabled: 'bg-gray-900 text-gray-600 cursor-not-allowed border border-gray-800',
    },
    dropdown: {
        trigger: 'bg-gray-900 hover:bg-gray-800 hover:text-rose-100 text-rose-200 border border-rose-900',
        content: 'bg-gray-950 border border-rose-900 shadow-lg',
        item: 'text-rose-200 hover:bg-gray-900 hover:text-rose-100 focus:bg-gray-900',
        separator: 'bg-rose-900',
        selected: 'bg-gray-900 text-rose-100',
        active: 'bg-gray-900 text-rose-200',
        disabled: 'bg-gray-900 text-gray-600 cursor-not-allowed'
    },
    card: {
        base: 'bg-gray-950 border border-rose-900 shadow-lg rounded-lg',
        header: 'border-b border-rose-900 bg-gray-900',
        content: 'bg-gray-950',
        footer: 'border-t border-rose-900 bg-gray-900',
    },
    nodes: {
        state: {
            size: 'w-60 h-28',
            icon: 'text-rose-100',
            header: 'bg-rose-900',
            headerText: 'text-rose-100'
        },
        processor: {
            size: 'w-60 h-28',
            icon: 'text-rose-100',
            header: 'bg-gray-900',
            headerText: 'text-rose-100'
        }
    },
    edge: edge,
    toggle: toggle,
    tab: {
        section: {
            header: "bg-gray-900",
            hover: "hover:bg-gray-800"
        }
    },
    datatable: {
        header: "bg-gray-900 hover:bg-gray-800 border-b border-r px-2 py-2 text-left text-rose-100",
    },
    checkbox: {
        base: 'border-rose-800 bg-gray-950',
        checked: 'bg-rose-700 border-rose-600',
        disabled: 'border-rose-950 bg-gray-900 opacity-50',
        checkColor: '#ffffff',
        checkedBg: 'rgb(225, 29, 72)'
    }
}

export default crimson