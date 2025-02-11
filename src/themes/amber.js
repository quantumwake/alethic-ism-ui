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
    hover: 'hover:bg-amber-950',
    input: input,
    icon: 'text-amber-500',
    font: 'font-["VT323"]',
    effects: {
        enableScanlines: true,
        enableCrt: true,
        scanlineClass: 'relative before:pointer-events-none before:absolute before:inset-0 before:bg-scanline',
        crtClass: 'relative rounded-md overflow-hidden before:absolute before:inset-0 before:pointer-events-none before:bg-crt'
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
        primary: 'bg-amber-700 hover:bg-amber-600 text-black border border-amber-500 shadow-inner shadow-amber-950',
        secondary: 'bg-amber-950 hover:bg-amber-900 text-amber-500 border border-amber-800',
        ghost: 'bg-transparent hover:bg-amber-950 text-amber-500 border border-amber-900',
        danger: 'bg-red-900 hover:bg-red-800 text-amber-300 border border-red-700',
        disabled: 'bg-amber-950 text-amber-800 cursor-not-allowed border border-amber-900',
    },
    dropdown: {
        trigger: 'bg-black hover:bg-amber-950 text-amber-500 border border-amber-900',
        content: 'bg-black border border-amber-900 shadow-lg',
        item: 'text-amber-500 hover:bg-amber-950 focus:bg-amber-900',
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
    edge: edge,
    toggle: toggle
}

export default amber;