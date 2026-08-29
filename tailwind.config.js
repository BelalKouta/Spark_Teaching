/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          base: '#0B0B0C',
          card: '#161618',
          raised: '#1F1F23',
          border: '#2A2A2E',
        },
        gold: {
          50: '#FBF6E3',
          100: '#F5E9C0',
          200: '#E6CA65',
          300: '#D4AF37',
          400: '#C5A059',
          500: '#B8923D',
          600: '#9C7A2E',
          700: '#7A5E22',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 0 1px rgba(212,175,55,0.4), 0 0 24px -4px rgba(212,175,55,0.35)',
        'gold-glow-lg': '0 0 0 1px rgba(212,175,55,0.5), 0 0 40px -6px rgba(212,175,55,0.45)',
        'card': '0 8px 32px -12px rgba(0,0,0,0.6)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-in': 'scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
