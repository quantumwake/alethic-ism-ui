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
        primary: 'bg-midnight-info hover:bg-midnight-info-bright hover:shadow-[0_0_12px_rgba(59,130,246,0.5)] text-white border border-midnight-info-bright/50 hover:border-midnight-info-bright active:bg-midnight-info transition-all duration-150',
        secondary: 'bg-midnight-surface hover:bg-midnight-raised hover:border-midnight-accent/60 hover:text-midnight-accent-bright text-midnight-text-secondary border border-midnight-border active:bg-midnight-elevated transition-all duration-150',
        ghost: 'bg-transparent hover:bg-midnight-elevated hover:text-midnight-accent-bright hover:border-midnight-accent text-midnight-text-body border border-midnight-border active:bg-midnight-raised transition-all duration-150',
        danger: 'bg-midnight-danger hover:bg-midnight-danger-bright hover:shadow-[0_0_12px_rgba(239,68,68,0.5)] text-white border border-midnight-danger-bright/50 hover:border-midnight-danger-bright active:bg-midnight-danger transition-all duration-150',
        success: 'bg-midnight-success hover:bg-midnight-success-bright hover:shadow-[0_0_12px_rgba(34,197,94,0.5)] text-white border border-midnight-success-bright/50 hover:border-midnight-success-bright active:bg-midnight-success transition-all duration-150',
        warning: 'bg-midnight-warning hover:bg-midnight-warning-bright hover:shadow-[0_0_12px_rgba(234,179,8,0.4)] text-midnight-base border border-midnight-warning-bright/50 hover:border-midnight-warning-bright active:bg-midnight-warning transition-all duration-150',
        info: 'bg-midnight-info hover:bg-midnight-info-bright hover:shadow-[0_0_12px_rgba(59,130,246,0.5)] text-white border border-midnight-info-bright/50 hover:border-midnight-info-bright active:bg-midnight-info transition-all duration-150',
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
    // Node styling for flow editor
    nodes: {
        // Standard size for all nodes
        size: 'w-52 min-h-[100px]',
        // State nodes (green)
        state: {
            size: 'w-52 min-h-[100px]',
            container: 'bg-gradient-to-br from-midnight-success/30 via-midnight-elevated to-midnight-surface',
            border: 'border-2 border-midnight-border',
            borderSelected: 'border-2 border-midnight-success-bright shadow-midnight-success',
            icon: 'text-midnight-success-bright',
            header: 'border-b border-midnight-border/50',
            headerText: 'text-midnight-success-bright font-semibold text-xs uppercase tracking-wide'
        },
        // Processor nodes (blue)
        processor: {
            size: 'w-52 min-h-[100px]',
            container: 'bg-gradient-to-br from-midnight-info/30 via-midnight-elevated to-midnight-surface',
            border: 'border-2 border-midnight-border',
            borderSelected: 'border-2 border-midnight-info-bright shadow-midnight-info',
            icon: 'text-midnight-info-bright',
            header: 'border-b border-midnight-border/50',
            headerText: 'text-midnight-info-bright font-semibold text-xs uppercase tracking-wide'
        },
        // Transform nodes (purple/accent)
        transform: {
            size: 'w-52 min-h-[100px]',
            container: 'bg-gradient-to-br from-midnight-accent/30 via-midnight-elevated to-midnight-surface',
            border: 'border-2 border-midnight-border',
            borderSelected: 'border-2 border-midnight-accent-bright shadow-midnight-glow',
            icon: 'text-midnight-accent-bright',
            header: 'border-b border-midnight-border/50',
            headerText: 'text-midnight-accent-bright font-semibold text-xs uppercase tracking-wide'
        },
        // Function nodes (amber/warning)
        function: {
            size: 'w-52 min-h-[100px]',
            container: 'bg-gradient-to-br from-midnight-warning/30 via-midnight-elevated to-midnight-surface',
            border: 'border-2 border-midnight-border',
            borderSelected: 'border-2 border-midnight-warning-bright shadow-midnight-glow',
            icon: 'text-midnight-warning-bright',
            header: 'border-b border-midnight-border/50',
            headerText: 'text-midnight-warning-bright font-semibold text-xs uppercase tracking-wide'
        },
    },
    // Selection ring for focused elements
    selection: {
        ring: 'ring-2 ring-midnight-accent ring-offset-2 ring-offset-midnight-base',
        border: 'border-2 border-midnight-accent-bright',
    },
    // Resize handles
    resize: {
        handle: 'bg-midnight-accent hover:bg-midnight-accent-bright',
        border: 'border-midnight-accent',
    },
    // Toolbar buttons (matching CustomStudio pattern)
    toolbar: {
        container: 'bg-midnight-surface/95 backdrop-blur-sm border border-midnight-border rounded-md shadow-lg',
        button: {
            base: 'p-1.5 rounded-md transition-colors',
            success: 'bg-green-900/30 text-green-400 hover:bg-green-600 hover:text-white',
            info: 'bg-blue-900/30 text-blue-400 hover:bg-blue-600 hover:text-white',
            accent: 'bg-purple-900/30 text-purple-400 hover:bg-purple-600 hover:text-white',
            warning: 'bg-amber-900/30 text-amber-400 hover:bg-amber-600 hover:text-white',
            danger: 'bg-red-900/30 text-red-400 hover:bg-red-600 hover:text-white',
            cyan: 'bg-cyan-900/30 text-cyan-400 hover:bg-cyan-600 hover:text-white',
        }
    },
    // Edge status colors (hex values for SVG)
    edgeStatus: {
        created: '#9ca3af',
        queued: '#4b5563',
        route: '#eab308',
        routed: '#f59e0b',
        running: '#3b82f6',
        completed: '#22c55e',
        failed: '#ef4444',
        default: '#8b5cf6',
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
