/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-soft': 'pulseSoft 2s infinite',
        'gradient': 'gradient 3s ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      colors: {
        // KALM Brand Color Palette - Clean White Theme
        'kalm-primary': '#1E40AF',      // Dark Blue
        'kalm-secondary': '#1F2937',    // Dark Gray
        'kalm-accent1': '#6366F1',      // Indigo
        'kalm-accent2': '#10B981',      // Emerald
        'kalm-background': '#FFFFFF',   // Crisp White
        'kalm-surface': '#F9FAFB',      // Light Gray Surface
        'kalm-gold': '#D97706',         // Darker Gold
        'kalm-dark': '#111827',         // Very Dark Gray (for text)
        'kalm-text': '#111827',         // Black text
        'kalm-text-light': '#6B7280',   // Gray text
        // Legacy kalm object for backward compatibility
        kalm: {
          primary: '#1E40AF',
          secondary: '#1F2937',
          accent1: '#6366F1',
          accent2: '#10B981',
          background: '#FFFFFF',
          surface: '#F9FAFB',
          gold: '#D97706',
          dark: '#111827',
          text: '#111827',
          'text-light': '#6B7280',
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      boxShadow: {
        'gold': '0 4px 24px 0 rgba(217, 119, 6, 0.2)',
        'gold-lg': '0 8px 32px 0 rgba(217, 119, 6, 0.3)',
        'gold-xl': '0 12px 48px 0 rgba(217, 119, 6, 0.4)',
        'blue': '0 4px 24px 0 rgba(30, 64, 175, 0.2)',
        'blue-lg': '0 8px 32px 0 rgba(30, 64, 175, 0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderWidth: {
        '3': '3px',
      },
      spacing: {
        '18': '4.5rem',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
  safelist: [
    // Dynamic color classes for tabs
    'text-blue-600',
    'text-indigo-600', 
    'text-purple-600',
    'text-green-600',
    'text-yellow-600',
    'text-red-600',
    'text-pink-600',
    'border-blue-500',
    'border-indigo-500',
    'border-purple-500',
    'border-green-500',
    'border-yellow-500',
    'border-red-500',
    'border-pink-500',
    'bg-blue-50/50',
    'bg-indigo-50/50',
    'bg-purple-50/50',
    'bg-green-50/50',
    'bg-yellow-50/50',
    'bg-red-50/50',
    'bg-pink-50/50',
    // Gradient classes
    'from-blue-500',
    'from-blue-600',
    'from-blue-700',
    'to-indigo-500',
    'to-indigo-600',
    'to-indigo-700',
    'from-purple-500',
    'from-purple-600',
    'to-pink-500',
    'to-pink-600',
    'from-green-500',
    'from-green-600',
    'to-emerald-500',
    'to-emerald-600',
    'from-yellow-500',
    'from-yellow-600',
    'to-orange-500',
    'to-orange-600',
    'from-red-500',
    'from-red-600',
    'to-rose-500',
    'to-rose-600',
    'bg-gradient-to-r',
    'bg-gradient-to-br',
    // KALM brand colors
    'bg-kalm-primary',
    'bg-kalm-secondary',
    'bg-kalm-accent1',
    'bg-kalm-accent2',
    'bg-kalm-background',
    'bg-kalm-surface',
    'bg-kalm-gold',
    'bg-kalm-dark',
    'text-kalm-primary',
    'text-kalm-secondary',
    'text-kalm-accent1',
    'text-kalm-accent2',
    'text-kalm-text',
    'text-kalm-text-light',
    'text-kalm-gold',
    'text-kalm-dark',
    'border-kalm-primary',
    'border-kalm-secondary',
    'border-kalm-accent1',
    'border-kalm-accent2',
    'border-kalm-gold',
    'hover:bg-kalm-primary',
    'hover:bg-kalm-accent1',
    'hover:text-kalm-primary',
    'hover:border-kalm-primary',
    'hover:shadow-gold',
    'hover:shadow-gold-lg',
    'hover:shadow-gold-xl',
    'hover:shadow-blue',
    'hover:shadow-blue-lg',
    'shadow-gold',
    'shadow-gold-lg',
    'shadow-gold-xl',
    'shadow-blue',
    'shadow-blue-lg',
  ]
} 