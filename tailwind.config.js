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
                    // Background layers with depth - lighter for better visibility
                    base: '#16161e',
                    surface: '#1c1c2c',
                    elevated: '#24243a',
                    raised: '#2e2e50',

                    // Borders with blue undertones
                    border: '#2a2a45',
                    'border-subtle': '#3a4a70',
                    'border-glow': '#5070a0',

                    // Text hierarchy
                    'text-primary': '#ffffff',
                    'text-secondary': '#e8e8f8',
                    'text-body': '#c0c0e0',
                    'text-muted': '#9090c0',
                    'text-subdued': '#6868a8',
                    'text-disabled': '#4848a0',
                    'text-hint': '#383880',
                    'text-label': '#8098d0',

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
                'midnight-glow': '0 0 25px rgba(139, 92, 246, 0.2)',
                'midnight-glow-sm': '0 0 12px rgba(139, 92, 246, 0.15)',
                'midnight-glow-lg': '0 0 40px rgba(139, 92, 246, 0.25)',
                'midnight-danger': '0 0 20px rgba(248, 113, 113, 0.3)',
                'midnight-success': '0 0 20px rgba(52, 211, 153, 0.3)',
                'midnight-info': '0 0 20px rgba(96, 165, 250, 0.3)',
            }
        }
    }
}
