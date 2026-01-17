import type { Config } from "tailwindcss"

export default {
    content: ["./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                bg: "rgb(var(--bg) / <alpha-value>)",
                card: "rgb(var(--card) / <alpha-value>)",
                text: "rgb(var(--text) / <alpha-value>)",
                muted: "rgb(var(--muted) / <alpha-value>)",
                border: "rgb(var(--border) / <alpha-value>)",
                primary: "rgb(var(--primary) / <alpha-value>)",
                primaryText: "rgb(var(--primaryText) / <alpha-value>)",
                accent: "rgb(var(--accent) / <alpha-value>)",
            },
        },
    },
    plugins: [],
} satisfies Config
