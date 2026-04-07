/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C9A227',
          50: '#FAF3DC',
          100: '#F5E7B9',
          200: '#ECCF73',
          300: '#E3B82E',
          400: '#C9A227',
          500: '#A8871F',
          600: '#876C18',
          700: '#665111',
          800: '#45360A',
          900: '#241B03',
        },
        navy: {
          DEFAULT: '#1B2A4A',
          50: '#E8EBF2',
          100: '#C6CCE0',
          200: '#8A95BB',
          300: '#4E5E96',
          400: '#2A3A6B',
          500: '#1B2A4A',
          600: '#152138',
          700: '#0F1827',
          800: '#090F15',
          900: '#030608',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-pattern': "linear-gradient(135deg, rgba(27,42,74,0.92) 0%, rgba(27,42,74,0.7) 100%)",
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
