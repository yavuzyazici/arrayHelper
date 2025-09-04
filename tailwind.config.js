/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'dark-gray': '#20262C',
        'light-purple': '#8C85FF',
        'navy-blue': '#1C274C',
        'light-blue': '#D5DFFF',
        'light-gray': '#F4F4F4',
        'red': '#DE2E24',
        'off-white': '#F6F8FE',
        'cool-gray': '#afb4c2',
        'mid-gray': '#767a8a',
      },
    },
  },
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
  ],
}