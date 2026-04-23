/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#a78bfa', // Violet 400
          DEFAULT: '#7c3aed', // Violet 600
          dark: '#5b21b6', // Violet 800
        }
      }
    },
  },
  plugins: [],
}
