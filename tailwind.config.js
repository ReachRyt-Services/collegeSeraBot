import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [
        daisyui
    ],
    daisyui: {
        themes: [
            {
                light: {
                    "primary": "#FF6201",
                    "secondary": "#E57C04",
                    "accent": "#F3B700",
                    "neutral": "#431407",
                    "base-100": "#ffffff",
                    "base-200": "#fff8f0",
                    "base-300": "#ffead6",
                    "info": "#3abff8",
                    "success": "#36d399",
                    "warning": "#fbbd23",
                    "error": "#f87272",
                },
            },
        ],
    },
}
