/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        coiny: ['var(--font-coiny)'],
        modak: ['var(--font-modak)'],
        fredoka: ['var(--font-fredoka)']
      },
      animation: {
        'spin-slow': 'spin 1.5s linear infinite'
      }

    },
  },
  plugins: [require('tailwind-scrollbar')],
}

