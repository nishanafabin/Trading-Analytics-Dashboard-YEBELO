/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4FC3F7',
        secondary: '#00FF7F',
        danger: '#FF4C4C',
        warning: '#FFD700',
        trading: {
          bg: '#0f0f0f',
          card: '#1c1c1c',
          border: '#2d2d2d',
          green: '#00FF7F',
          red: '#FF4C4C',
          gold: '#FFD700',
          blue: '#4FC3F7'
        }
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}