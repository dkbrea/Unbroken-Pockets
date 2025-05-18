/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      colors: {
        primary: 'var(--primary)',
        'primary-light': 'var(--primary-light)',
        'primary-dark': 'var(--primary-dark)',
        white: 'var(--white)',
        dark: {
          100: '#1a1a1a',
          200: '#171717',
          300: '#121212',
          400: '#0a0a0a',
          500: '#050505',
        },
        background: {
          light: 'var(--background-light)',
          lighter: 'var(--background-lighter)',
        },
        text: {
          dark: 'var(--text-dark)',
          medium: 'var(--text-medium)',
          light: 'var(--text-light)',
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
        'grid-pattern': 'radial-gradient(#333 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-size': '30px 30px',
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      perspective: {
        500: '500px',
        1000: '1000px',
        2000: '2000px',
      },
      transformStyle: {
        'preserve-3d': 'preserve-3d',
      },
      transformOrigin: {
        'center-bottom': 'center bottom',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}; 