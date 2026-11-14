/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        domino: {
          dark: '#080d1a',
          card: '#0f172a',
          board: '#0f291e',
          felt: '#133e28',
          accent: '#2563eb',
          gold: '#f59e0b',
          ivory: '#fcfaf2',
          rivet: '#b45309',
        }
      },
      boxShadow: {
        'tile-tactile': '0 5px 12px -2px rgba(0,0,0,0.45), 0 2px 4px -1px rgba(0,0,0,0.3), inset 0 1.5px 1px rgba(255,255,255,0.95), inset 0 -1.5px 1px rgba(0,0,0,0.08)',
        'tile-hover': '0 12px 20px -3px rgba(0,0,0,0.55), 0 4px 8px -2px rgba(0,0,0,0.35), inset 0 2px 1.5px rgba(255,255,255,1)',
        'felt-vignette': 'inset 0 0 140px rgba(0,0,0,0.85)',
        'glass-glow': '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      }
    },
  },
  plugins: [],
}
