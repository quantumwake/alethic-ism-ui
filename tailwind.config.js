/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
    plugins: [
        function({ addUtilities }) {
            const newUtilities = {
                '.stroke-nodash': {
                    strokeDasharray: 'none',
                },
            };
            addUtilities(newUtilities);
        },
    ],
}