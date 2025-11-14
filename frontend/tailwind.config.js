/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",             // pour le fichier HTML principal
    "./src/**/*.{js,jsx,ts,tsx}" // pour tous tes fichiers React
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      
    },
  },
  plugins: [],
};
 