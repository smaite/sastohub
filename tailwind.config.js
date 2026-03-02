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
          DEFAULT: '#ff4d4d',
          dark: '#e60000',
        },
        secondary: '#2d3436',
      }
    },
  },
  plugins: [],
}
