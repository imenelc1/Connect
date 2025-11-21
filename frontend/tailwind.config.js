/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,html}",
    "./public/index.html",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        tertiary: "rgb(var(--color-tertiary) / <alpha-value>)",
        grayc: "rgb(var(--color-gray) / <alpha-value>)",
        background: "rgb(var(--color-bg) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        textc: "rgb(var(--color-text) / <alpha-value>)",
      },
      backgroundImage: {
        "grad-1": "var(--grad-1)",
        "grad-2": "var(--grad-2)",
        "grad-3": "var(--grad-3)",
        "grad-4": "var(--grad-4)",
        "grad-dark-1": "var(--grad-dark-1)",
        "grad-dark-2": "var(--grad-dark-2)",
        "grad-dark-3": "var(--grad-dark-3)",
        "grad-dark-4": "var(--grad-dark-4)",
      },
    },
  },
  plugins: [],
};