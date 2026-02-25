/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      animation: {
        'slideIn': 'slideIn 0.3s ease-out',
        'fadeIn': 'fadeIn 0.5s ease-out',
        'shake': 'shake 0.5s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'checkmark': 'checkmark 0.6s ease-out',
      },
    },
  },
  plugins: [],
};
