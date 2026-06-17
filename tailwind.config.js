/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: ['"DM Mono"', '"Roboto Mono"', 'Menlo', 'monospace'],
      },
      colors: {
        bg:      { DEFAULT: '#0d0d10', soft: '#15151a', card: '#1a1a21', hover: '#22222a', border: '#2c2c38' },
        ink:     { primary: '#f0f0f6', secondary: '#8888a0', muted: '#44445a' },
        accent:  { DEFAULT: '#7c6fff', soft: '#9e98ff', dim: '#1e1c3a' },
        ok:      { DEFAULT: '#34d399', dim: '#0a2419' },
        err:     { DEFAULT: '#f87171', dim: '#2a0d0d' },
        warn:    { DEFAULT: '#fbbf24', dim: '#271e07' },
        daily:   { DEFAULT: '#fb923c', dim: '#271300' },
        note:    { DEFAULT: '#60a5fa', dim: '#0a1828' },
      },
      animation: {
        'pop':       'pop 0.16s cubic-bezier(0.34,1.6,0.64,1) both',
        'shake':     'shake 0.35s ease both',
        'fade-in':   'fadeIn 0.18s ease both',
        'slide-up':  'slideUp 0.22s cubic-bezier(0.34,1.4,0.64,1) both',
        'ripple':    'ripple 0.5s ease-out both',
        'celebrate': 'celebrate 0.6s cubic-bezier(0.34,1.6,0.64,1) both',
      },
      keyframes: {
        pop:       { '0%': { transform: 'scale(0.8)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        shake:     { '0%,100%': { transform: 'translateX(0)' }, '20%': { transform: 'translateX(-5px)' }, '60%': { transform: 'translateX(5px)' } },
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { transform: 'translateY(16px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        ripple:    { from: { transform: 'scale(0.6)', opacity: '0.6' }, to: { transform: 'scale(1.4)', opacity: '0' } },
        celebrate: { '0%': { transform: 'scale(0.7) rotate(-5deg)', opacity: '0' }, '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' } },
      },
      boxShadow: {
        'cell-selected': '0 0 0 2px #7c6fff',
        'cell-related':  'inset 0 0 0 1px rgba(124,111,255,0.2)',
        'glow-accent':   '0 0 20px rgba(124,111,255,0.4)',
        'glow-ok':       '0 0 20px rgba(52,211,153,0.3)',
      },
    },
  },
  plugins: [],
};
