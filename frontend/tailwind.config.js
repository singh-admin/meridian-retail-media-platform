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
        aviation: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e',
          950: '#082f49'
        },
        terminal: {
          dark: '#0b1120',
          card: '#1e293b',
          border: '#334155',
          neon: '#38bdf8'
        }
      }
    },
  },
  plugins: [],
}
