import edge from "./pro/components/edge";
import input from "./pro/components/input";
import toggle from "./pro/components/toggle";
export const pro = {
    bg: 'bg-black',
    text: 'text-amber-400 text-xs',
    textMuted: 'text-amber-800',
    textAccent: 'text-amber-300',
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
    border: 'border-amber-800',
    hover: 'hover:bg-amber-950 hover:border-amber-700',
    input: input,
    icon: 'text-amber-400',
    font: 'font-["VT323"]',
    effects: {
        enableScanlines: true,
        enableCrt: true,
        scanlineClass: 'relative before:pointer-events-none before:absolute before:inset-0 before:bg-scanline before:animate-scanline',
        crtClass: 'relative rounded-md overflow-hidden before:absolute before:inset-0 before:pointer-events-none before:bg-crt before:animate-crt'
    },
    default: {
        text: {
            primary: 'text-amber-400',
            secondary: 'text-amber-300',
            muted: 'text-amber-800',
            accent: 'text-amber-200'
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
        primary: 'bg-amber-800 hover:bg-amber-700 text-black border border-amber-600',
        secondary: 'bg-black hover:bg-amber-950 text-amber-400 border border-amber-700',
        ghost: 'bg-transparent hover:bg-amber-950 text-amber-400 border border-amber-800',
        danger: 'bg-red-900 hover:bg-red-800 text-amber-200 border border-red-800',
        disabled: 'bg-amber-950 text-amber-800 cursor-not-allowed border border-amber-900',
    },
    dropdown: {
        trigger: 'bg-black hover:bg-amber-950 text-amber-400 border border-amber-800',
        content: 'bg-black border border-amber-800 shadow-lg',
        item: 'text-amber-400 hover:bg-amber-950 focus:bg-amber-900',
        separator: 'bg-amber-800',
        selected: 'bg-amber-900 text-amber-200',
        active: 'bg-amber-950 text-amber-300',
        disabled: 'bg-amber-950 text-amber-800 cursor-not-allowed'
    },
    card: {
        base: 'bg-black border border-amber-800 shadow-lg rounded-lg',
        header: 'border-b border-amber-800 bg-amber-950',
        content: 'bg-black',
        footer: 'border-t border-amber-800 bg-amber-950',
    },
    edge: edge,
    toggle: toggle
}

export default pro