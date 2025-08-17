import edge from "./pro/components/edge";
import input from "./pro/components/input";
import toggle from "./pro/components/toggle";
export const pro = {
    bg: 'bg-gray-900',
    text: 'text-gray-100 text-xs',
    textMuted: 'text-gray-400',
    textAccent: 'text-white',
    glowColor: 'rgb(255, 255, 255)', // white
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
    border: 'border-gray-700',
    hover: 'hover:bg-gray-800 hover:text-white',
    files: {
        select: 'bg-gray-700 text-white',
    },
    input: input,
    icon: 'text-gray-400',
    font: 'font-["VT323"]',
    hoverMenu: {
        // the button or icon that you hover to open the menu
        trigger: 'text-gray-200 hover:bg-gray-700 hover:text-white',
        // the menu panel itself
        content: 'bg-gray-900 border-2 border-gray-700 shadow-lg',
        // each top-level menu item
        item: 'text-gray-200 hover:bg-gray-700 hover:text-white focus:bg-gray-700',
        // submenu container & items
        subItems: {
            // the submenu panel
            content: 'bg-gray-900 border border-gray-700',
            // each submenu item
            item: 'text-gray-200 hover:bg-gray-700 hover:text-white focus:bg-gray-700'
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
            primary: 'text-gray-100',
            secondary: 'text-gray-300',
            muted: 'text-gray-500',
            accent: 'text-white'
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
        primary: 'bg-gray-700 hover:bg-gray-600 hover:text-white text-white border border-gray-600 shadow-sm',
        secondary: 'bg-gray-800 hover:bg-gray-700 hover:text-white text-gray-100 border border-gray-600',
        ghost: 'bg-transparent hover:bg-gray-800 hover:text-white text-gray-300 border border-gray-600',
        danger: 'bg-red-800 hover:bg-red-700 hover:text-white text-white border border-red-600',
        disabled: 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700',
    },
    dropdown: {
        trigger: 'bg-gray-800 hover:bg-gray-700 hover:text-white text-gray-200 border border-gray-600',
        content: 'bg-gray-900 border border-gray-700 shadow-lg',
        item: 'text-gray-200 hover:bg-gray-700 hover:text-white focus:bg-gray-700',
        separator: 'bg-gray-700',
        selected: 'bg-gray-700 text-white',
        active: 'bg-gray-800 text-gray-100',
        disabled: 'bg-gray-800 text-gray-600 cursor-not-allowed'
    },
    card: {
        base: 'bg-gray-900 border border-gray-700 shadow-lg rounded-lg',
        header: 'border-b border-gray-700 bg-gray-800',
        content: 'bg-gray-900',
        footer: 'border-t border-gray-700 bg-gray-800',
    },
    nodes: {
        state: {
            size: 'w-60 h-28',
            icon: 'text-gray-100',
            header: 'bg-gray-700',
            headerText: 'text-gray-100'
        },
        processor: {
            size: 'w-60 h-28',
            icon: 'text-gray-100',
            header: 'bg-gray-800',
            headerText: 'text-gray-100'
        }
    },
    edge: edge,
    toggle: toggle,
    tab: {
        section: {
            header: "bg-gray-800",
            hover: "hover:bg-gray-700"
        }
    },
    datatable: {
        header: "bg-gray-800 hover:bg-gray-700 border-b border-r px-2 py-2 text-left text-gray-100",
    },
    checkbox: {
        base: 'border-gray-600 bg-gray-900',
        checked: 'bg-blue-600 border-blue-500',
        disabled: 'border-gray-700 bg-gray-800 opacity-50',
        checkColor: '#ffffff',
        checkedBg: 'rgb(59, 130, 246)'
    }
}

export default pro