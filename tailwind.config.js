// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4f46e5',
          light: '#675ff0',
          dark: '#4338ca',
        },
        secondary: '#9333ea',
        accent: '#db2777',
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        success: '#16a34a',
        danger: '#dc2626',
        warning: '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
    }
  },
  plugins: [],
};
