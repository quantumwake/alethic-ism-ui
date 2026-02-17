import edge from "./midnightlab/components/edge";
import input from "./midnightlab/components/input";
import toggle from "./midnightlab/components/toggle";

export const midnightlab = {
    bg: 'bg-midnight-base',
    text: 'text-midnight-text-body text-xs',
    textMuted: 'text-midnight-accent',
    textAccent: 'text-midnight-accent-bright',
    glowColor: 'rgb(99, 102, 241)',
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
    border: 'border-midnight-border',
    hover: 'hover:bg-midnight-elevated hover:text-midnight-text-primary',
    files: {
        select: 'bg-midnight-raised text-midnight-accent-bright',
    },
    input: input,
    icon: 'text-midnight-text-subdued',
    font: 'font-ibm-plex',
    hoverMenu: {
        trigger: 'text-midnight-text-secondary hover:bg-midnight-elevated hover:text-midnight-text-primary',
        content: 'bg-midnight-surface border border-midnight-border shadow-midnight-glow',
        item: 'text-midnight-text-secondary hover:bg-midnight-elevated hover:text-midnight-accent-bright focus:bg-midnight-elevated',
        subItems: {
            content: 'bg-midnight-surface border border-midnight-border-subtle shadow-midnight-glow-sm',
            item: 'text-midnight-text-secondary hover:bg-midnight-elevated hover:text-midnight-accent-bright focus:bg-midnight-elevated'
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
            primary: 'text-midnight-text-primary',
            secondary: 'text-midnight-text-secondary',
            muted: 'text-midnight-text-subdued',
            accent: 'text-midnight-accent'
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
        primary: 'bg-midnight-info hover:bg-midnight-info-bright hover:shadow-midnight-info text-white border border-midnight-info-bright/50 transition-all duration-200',
        secondary: 'bg-midnight-surface hover:bg-midnight-elevated hover:border-midnight-border-glow text-midnight-text-secondary border border-midnight-border transition-all duration-200',
        ghost: 'bg-transparent hover:bg-midnight-elevated hover:text-midnight-accent-bright text-midnight-text-body border border-midnight-border transition-all duration-200',
        danger: 'bg-midnight-danger hover:bg-midnight-danger-bright hover:shadow-midnight-danger text-white border border-midnight-danger-bright/50 transition-all duration-200',
        disabled: 'bg-midnight-surface text-midnight-text-disabled cursor-not-allowed border border-midnight-border',
    },
    dropdown: {
        trigger: 'bg-midnight-surface hover:bg-midnight-elevated hover:border-midnight-border-glow text-midnight-text-body border border-midnight-border transition-all duration-200',
        content: 'bg-midnight-surface border border-midnight-border shadow-midnight-glow',
        item: 'text-midnight-text-body hover:bg-midnight-elevated hover:text-midnight-accent-bright focus:bg-midnight-elevated transition-colors duration-150',
        separator: 'bg-midnight-border',
        selected: 'bg-midnight-raised text-midnight-accent-bright',
        active: 'bg-midnight-elevated text-midnight-text-secondary',
        disabled: 'bg-midnight-surface text-midnight-text-disabled cursor-not-allowed'
    },
    card: {
        base: 'bg-midnight-surface border border-midnight-border shadow-midnight-glow-sm rounded-lg',
        header: 'border-b border-midnight-border bg-midnight-elevated',
        content: 'bg-midnight-surface',
        footer: 'border-t border-midnight-border bg-midnight-elevated',
    },
    nodes: {
        state: {
            size: 'w-60 h-28',
            icon: 'text-midnight-success-bright',
            header: 'bg-gradient-to-r from-midnight-success/50 via-midnight-success/25 to-midnight-raised',
            headerText: 'text-midnight-success-bright font-medium'
        },
        processor: {
            size: 'w-60 h-28',
            icon: 'text-midnight-info-bright',
            header: 'bg-gradient-to-r from-midnight-info/50 via-midnight-info/25 to-midnight-raised',
            headerText: 'text-midnight-info-bright font-medium'
        }
    },
    edge: edge,
    toggle: toggle,
    tab: {
        section: {
            header: "bg-midnight-surface",
            hover: "hover:bg-midnight-elevated"
        }
    },
    datatable: {
        header: "bg-midnight-elevated hover:bg-midnight-raised border-b border-r border-midnight-border px-2 py-2 text-left text-midnight-text-label transition-colors duration-150",
    },
    checkbox: {
        base: 'border-midnight-border bg-midnight-base',
        checked: 'bg-midnight-info border-midnight-info-bright shadow-midnight-info',
        disabled: 'border-midnight-border bg-midnight-surface opacity-50',
        checkColor: '#ffffff',
        checkedBg: 'rgb(59, 130, 246)'
    },
    usageReport: {
        tooltip: {
            bg: 'bg-midnight-base',
            border: 'border-midnight-info/30',
            headerText: 'from-midnight-accent to-midnight-info-bright',
            badge: 'bg-midnight-info/20 text-midnight-accent-bright border-midnight-info/40',
        },
        card: {
            bg: 'bg-midnight-surface/80',
            border: 'border-midnight-border/50',
            hoverBorder: 'hover:border-midnight-accent/40',
            titleText: 'text-midnight-accent',
            labelText: 'text-midnight-text-subdued',
            dotColor: 'bg-midnight-info-bright',
        }
    },
    // Semantic status states
    status: {
        danger: {
            text: 'text-midnight-danger-bright',
            bg: 'bg-midnight-danger/15',
            border: 'border-midnight-danger/40',
            activeBg: 'bg-midnight-danger/20',
            activeBorder: 'border-2 border-midnight-danger-bright',
            glow: 'shadow-midnight-danger',
        },
        warning: {
            text: 'text-midnight-warning-bright',
            bg: 'bg-midnight-warning/15',
            border: 'border-midnight-warning/40',
            activeBg: 'bg-midnight-warning/20',
            activeBorder: 'border-2 border-midnight-warning-bright',
        },
        success: {
            text: 'text-midnight-success-bright',
            bg: 'bg-midnight-success/15',
            border: 'border-midnight-success/40',
            activeBg: 'bg-midnight-success/20',
            activeBorder: 'border-2 border-midnight-success-bright',
            glow: 'shadow-midnight-success',
        },
        info: {
            text: 'text-midnight-info-bright',
            bg: 'bg-midnight-info/15',
            border: 'border-midnight-info/40',
            activeBg: 'bg-midnight-info/20',
            activeBorder: 'border-2 border-midnight-info-bright',
            glow: 'shadow-midnight-info',
        },
        inactive: {
            text: 'text-midnight-text-disabled',
            bg: 'bg-midnight-base/10',
            border: 'border-midnight-border',
        }
    }
}

export default midnightlab
