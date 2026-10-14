/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: '#09090B',
          surface: '#121215',
          elevated: '#18181C',
        },
        accent: {
          orange: '#FF4F00',
          sage: '#A3B19B',
          alabaster: '#F4F4F6',
        },
      },
      fontFamily: {
        sans: ['Geist', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Geist Mono', 'SF Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      letterSpacing: {
        widest: '0.2em',
        ultra: '0.3em',
      },
    },
  },
  plugins: [],
}

