/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'burgundy': {
          DEFAULT: '#560400¿¿',
          50: '#F5E8E9',
          100: '#E8D1D3',
          200: '#D1A3A7',
          300: '#BA757B',
          400: '#A3474F',
          500: '#6B0F1A',
          600: '#560C15',
          700: '#410910',
          800: '#2C060B',
          900: '#170306',
        },
        'gold': {
          DEFAULT: '#D4AF37',
          light: '#E8D098',
          dark: '#A88B2C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}