export default {
    content: ["./index.html", "./src/**/*.{html,js,jsx,ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                'vt323': ['VT323', 'monospace'],
                'ibm-plex': ['IBM Plex Mono', 'monospace']
            },
            colors: {
                midnight: {
                    // Background layers - darker black/charcoal
                    base: '#0e0e10',
                    surface: '#161618',
                    elevated: '#1e1e22',
                    raised: '#28282e',

                    // Borders - dark gray
                    border: '#333338',
                    'border-subtle': '#404048',
                    'border-glow': '#505058',

                    // Text hierarchy - neutral
                    'text-primary': '#ffffff',
                    'text-secondary': '#e8e8ec',
                    'text-body': '#c8c8d0',
                    'text-muted': '#9898a0',
                    'text-subdued': '#707078',
                    'text-disabled': '#585860',
                    'text-hint': '#484850',
                    'text-label': '#a0a0b0',

                    // Vibrant accents - pumped up
                    danger: '#ef4444',
                    'danger-bright': '#f87171',
                    'danger-glow': '#fca5a5',
                    warning: '#f59e0b',
                    'warning-bright': '#fbbf24',
                    success: '#10b981',
                    'success-bright': '#34d399',
                    'success-glow': '#6ee7b7',
                    info: '#3b82f6',
                    'info-bright': '#60a5fa',
                    'info-glow': '#93c5fd',
                    accent: '#8b5cf6',
                    'accent-bright': '#a78bfa',
                    'accent-glow': '#c4b5fd',

                    // Special effects
                    glow: '#7c3aed',
                    shimmer: '#a855f7',
                    electric: '#06b6d4',
                }
            },
            boxShadow: {
                'midnight-glow': '0 0 20px rgba(96, 165, 250, 0.2)',
                'midnight-glow-sm': '0 0 10px rgba(96, 165, 250, 0.15)',
                'midnight-glow-lg': '0 0 30px rgba(96, 165, 250, 0.25)',
                'midnight-danger': '0 0 15px rgba(248, 113, 113, 0.3)',
                'midnight-success': '0 0 15px rgba(52, 211, 153, 0.3)',
                'midnight-info': '0 0 15px rgba(96, 165, 250, 0.3)',
            }
        }
    }
}
