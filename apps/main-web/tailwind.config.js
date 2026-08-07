/** @type {import('tailwindcss').Config} */// tailwind.config.js
module.exports = {
  darkMode: 'class', // This tells Tailwind to use class-based dark mode
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    '../../packages/ui/src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}



