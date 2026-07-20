/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.njk"],
  theme: {
    extend: {
      fontFamily: { inter: ['Inter', 'sans-serif'] },
      colors: {
        'bg-deep':    '#060e07',
        'bg-forest':  '#0d1f0f',
        'bg-purple':  '#1B0F2A',
        'green':      '#4CAF50',
        'green-soft': '#81c784',
        'purple':     '#8B6ED0',
        'text-main':  '#f0fdf4',
      },
    },
  },
  plugins: [],
};
