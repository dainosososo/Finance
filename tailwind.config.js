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
        dark: {
          900: '#0B0F19',
          800: '#111827',
          700: '#1F2937',
          600: '#374151',
        },
        stock: {
          up: '#EF4444',     // Taiwan Red for Gain (漲)
          upLight: '#FEE2E2',
          down: '#10B981',   // Taiwan Green for Loss (跌)
          downLight: '#D1FAE5',
          flat: '#9CA3AF',   // Gray for Flat (平)
          accent: '#3B82F6', // Blue accent
          gold: '#F59E0B'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ticker': 'ticker 30s linear infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
