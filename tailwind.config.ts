import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dark': '#050505',
        'surface': '#0f1115',
        'surface-elevated': '#13171f',
        'border': 'rgba(255, 255, 255, 0.06)',
        'accent': '#00b7ff',
        'gold': '#FFD700',
        'primary': '#00b7ff',
        'secondary': '#a0afc4',
        'success': '#22C55E',
        'warning': '#F59E0B',
        'danger': '#EF4444',
        'text-primary': '#ffffff',
        'text-secondary': '#a0afc4',
      },
      backgroundColor: {
        dark: '#050505',
        surface: '#0f1115',
        'surface-elevated': '#13171f',
      },
      textColor: {
        primary: '#ffffff',
        secondary: '#a0afc4',
      },
      borderColor: {
        DEFAULT: 'rgba(255, 255, 255, 0.06)',
      },
      spacing: {
        '0': '0',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
      },
      fontSize: {
        xs: ['12px', { lineHeight: '1.5' }],
        sm: ['14px', { lineHeight: '1.5' }],
        base: ['16px', { lineHeight: '1.6' }],
        lg: ['18px', { lineHeight: '1.6' }],
        xl: ['20px', { lineHeight: '1.7' }],
        '2xl': ['24px', { lineHeight: '1.8' }],
        '3xl': ['32px', { lineHeight: '1.8' }],
        '4xl': ['36px', { lineHeight: '1.1' }],
        '5xl': ['48px', { lineHeight: '1' }],
      },
      fontWeight: {
        regular: '400',
        semibold: '600',
        bold: '700',
        black: '900',
      },
      animation: {
        spin: 'spin 1s linear infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-ripple': 'pulseRipple 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        pulseRipple: {
          '0%': {
            boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.7)'
          },
          '50%': {
            boxShadow: '0 0 0 5px rgba(34, 197, 94, 0)'
          },
          '100%': {
            boxShadow: '0 0 0 5px rgba(34, 197, 94, 0)'
          }
        },
      },
      transitionDuration: {
        150: '150ms',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
