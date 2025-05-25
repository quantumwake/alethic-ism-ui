module.exports = {
    mode: 'jit',
    content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
    purge: {
        enabled: process.env.NODE_ENV === 'production',
        content: ["./src/**/*.{html,js,jsx,ts,tsx}"]
    },
    theme: {
        extend: {
            fontFamily: {
                'vt323': ['VT323', 'monospace'],
                'ibm-plex': ['IBM Plex Mono', 'monospace']
            }
        }
    }
}
