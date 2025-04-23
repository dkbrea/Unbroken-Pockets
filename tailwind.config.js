/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4A6FA1',
          light: '#7EB4E2',
        },
        background: {
          light: '#f0f6ff',
          lighter: '#f8fcff',
        },
        text: {
          dark: '#333',
          medium: '#555',
          light: '#777',
        },
      },
      borderRadius: {
        'sm': '5px',
        'md': '10px',
        'lg': '15px',
        'xl': '20px',
        'round': '30px',
      },
      boxShadow: {
        'sm': '0 5px 15px rgba(0, 0, 0, 0.05)',
        'md': '0 15px 30px rgba(0, 0, 0, 0.1)',
        'lg': '0 20px 50px rgba(0, 0, 0, 0.1)',
        'button': '0 4px 15px rgba(74, 111, 161, 0.2)',
        'button-hover': '0 8px 25px rgba(74, 111, 161, 0.4)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #4A6FA1 0%, #7EB4E2 100%)',
      },
    },
  },
  plugins: [],
}; 