/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        table: {
          dark: '#0f3822',
          DEFAULT: '#14532d',
          light: '#166534',
        }
      }
    },
  },
  plugins: [],
}
