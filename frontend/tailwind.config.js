/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,html}",
    "./public/index.html",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        supp: "rgb(var(--color-supp) / <alpha-value>)",
        tertiary: "rgb(var(--color-tertiary) / <alpha-value>)",
        grayc: "rgb(var(--color-gray) / <alpha-value>)",
        background: "rgb(var(--color-bg) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        textc: "rgb(var(--color-text) / <alpha-value>)",
        yellowc: "rgb(var(--color-yellow-code))" ,
        card_title: "rgb(var(--color-title-card))",
        icons_about: "rgb(var(--color-icons-about))",
        card: "rgb(var(--color-card) / <alpha-value>)",
        nav: "rgb(var(--color-nav) / <alpha-value>)",
        blue: "rgb(var(--color-blue) / <alpha-value>)",
        purple: "rgb(var(--color-purple) / <alpha-value>)",
        pink: "rgb(var(--color-pink) / <alpha-value>)",
        red: "rgb(var(--color-red) / <alpha-value>)",
         gray_light:"rgb(var(--color-gray-light) / <alpha-value>)",

        
      },
      backgroundImage: {
        "grad-1": "var(--grad-1)",
        "grad-2": "var(--grad-2)",
        "grad-3": "var(--grad-3)",
        "grad-4": "var(--grad-4)",
        "grad-5": "var(--grad-5)",
        "grad-7": "var(--grad-7)",
        "grad-dark-1": "var(--grad-dark-1)",
        "grad-dark-2": "var(--grad-dark-2)",
        "grad-dark-3": "var(--grad-dark-3)",
        "grad-dark-4": "var(--grad-dark-4)",
      },
    },
  },
  plugins: [],
};