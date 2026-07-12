/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        dark: {
          bg: '#0a0e17',
          surface: '#111827',
          card: '#1a2332',
          border: '#1e293b',
          primary: '#f59e0b',
          success: '#10b981',
          info: '#3b82f6',
          warning: '#f59e0b',
          danger: '#ef4444',
          muted: '#64748b',
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(245, 158, 11, 0.15)',
        'glow-sm': '0 0 10px rgba(245, 158, 11, 0.1)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
      },
    },
  },
  plugins: [],
}