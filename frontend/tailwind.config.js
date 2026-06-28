/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Verdana", "Geneva", "DejaVu Sans", "sans-serif"],
        display: ["Verdana", "Geneva", "DejaVu Sans", "sans-serif"],
      },
      colors: {
        indigo: {
          50: '#f1efff',
          100: '#e3e0ff',
          200: '#cac3ff',
          300: '#b9b3ff',
          400: '#8d85ff',
          500: '#6c63ff', // primary brand
          600: '#4c46e0',
          700: '#3a34b8',
          800: '#2c2790',
          900: '#211f6b',
        },
        mint: {
          50: '#e7fbf4',
          100: '#c8f5e6',
          200: '#8fe9d4',
          300: '#6fe2c6',
          400: '#54e0be',
          500: '#2bc9a4', // secondary brand
          600: '#1ea584',
          700: '#16826a',
          800: '#11604f',
          900: '#0c463a',
        },
        amber: {
          50: '#fff8ec',
          100: '#ffeece',
          200: '#ffe3a3',
          300: '#ffd27d',
          400: '#ffc266',
          500: '#ffb454', // highlight brand
          600: '#e8923a',
          700: '#c4722a',
          800: '#9c5720',
          900: '#7a431a',
        },
        clay: {
          bgLight: '#eef1f6',
          bgDark: '#0e0f17',
          panelLight: '#eef1f7',
          panelDark: '#1a1c29',
        }
      },
      boxShadow: {
        'clay-sm': 'inset 0 1px 2px rgba(255, 255, 255, 0.5), 0 2px 4px rgba(0, 0, 0, 0.15)',
        'clay-md': '-8px -8px 18px rgba(255,255,255,0.55), 12px 14px 26px rgba(90,92,145,0.28)',
        'clay-lg': '-10px -10px 22px rgba(255,255,255,0.6), 18px 22px 36px rgba(90,92,145,0.3)',
        'clay-indigo': 'inset 0 2px 4px rgba(255, 255, 255, 0.3), 0 10px 20px rgba(108, 99, 255, 0.25)',
        'clay-mint': 'inset 0 2px 4px rgba(255, 255, 255, 0.3), 0 10px 20px rgba(43, 201, 164, 0.25)',
        'clay-amber': 'inset 0 2px 4px rgba(255, 255, 255, 0.3), 0 10px 20px rgba(255, 180, 84, 0.25)',
      },
      borderRadius: {
        clay: '26px',
      }
    },
  },
  plugins: [],
}
