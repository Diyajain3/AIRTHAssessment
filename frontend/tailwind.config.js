/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        theme: {
          bg: '#0b0f17',
          card: '#111827',
          cardHover: '#161f30',
          border: '#1f293d',
          borderSubtle: '#162032',
        }
      }
    },
  },
  plugins: [],
}
