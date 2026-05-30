/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#c42548',
        secondary: '#7e1730',
        accent: '#f8b5d1',
        surface: '#15020c',
        border: 'rgba(255,255,255,0.12)',
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
