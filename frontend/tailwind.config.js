/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme colors from PRD
        'dark-bg': '#0a0e17', // Primary background
        'dark-surface': '#111827', // Surfaces/cards
        'dark-primary': '#ff9f0a', // Orange (Primary)
        'dark-success': '#10b981', // Green (Available/Success)
        'dark-info': '#3b82f6', // Blue (On Trip/Info)
        'danger': '#ef4444', // Red (Retired/Warning)
        'warning': '#f59e0b', // Amber for warnings
        'muted': '#6b7280', // Muted text
        'border': '#374151', // Border color
      },
      borderRadius: {
        'lg': '0.75rem',
        'xl': '1rem',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-hover': '0 12px 40px 0 rgba(0, 0, 0, 0.45)',
      },
      backdropFilter: {
        'blur': 'blur(12px)',
      },
      transitionDuration: {
        '2000': '2000ms',
      }
    },
  },
  plugins: [],
}