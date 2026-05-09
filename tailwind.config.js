/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'nexus': {
          'dark': '#0a0e27',
          'darker': '#050812',
          'gold': '#d4af37',
          'gold-light': '#e8c547',
          'silver': '#c0c0c0',
          'accent': '#00d4ff',
          'accent-dark': '#0099cc',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass': 'rgba(255, 255, 255, 0.05)',
      },
      backdropBlur: {
        'xl': '24px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(212, 175, 55, 0.3)',
        'glow-blue': '0 0 20px rgba(0, 212, 255, 0.3)',
        'premium': '0 20px 60px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
};
