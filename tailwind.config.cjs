/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#fdf8ef',
          100: '#faeeda',
          200: '#f5d9a8',
          300: '#efbe6c',
          400: '#e8a030',
          500: '#d4841a',
          600: '#b86612',
          700: '#924c12',
          800: '#773d16',
          900: '#633315',
          950: '#381808',
        },
        surface: {
          DEFAULT: '#0f0b06',
          50: '#1a1209',
          100: '#221608',
          200: '#2e1e0d',
          300: '#3d2810',
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease both',
        'slide-in': 'slideIn 0.3s ease both',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}
