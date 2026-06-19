/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"DM Mono"', '"Roboto Mono"', 'Menlo', 'monospace'],
      },
      colors: {
        bg:     { DEFAULT: 'var(--bg)', soft: 'var(--bg-soft)', card: 'var(--bg-card)', hover: 'var(--bg-hover)', border: 'var(--bg-border)' },
        ink:    { primary: 'var(--ink-primary)', secondary: 'var(--ink-secondary)', muted: 'var(--ink-muted)' },
        accent: { DEFAULT: 'var(--accent)', soft: 'var(--accent-soft)', dim: 'var(--accent-dim)' },
        ok:     { DEFAULT: 'var(--ok)', dim: 'var(--ok-dim)' },
        err:    { DEFAULT: 'var(--err)', dim: 'var(--err-dim)' },
        warn:   { DEFAULT: 'var(--warn)', dim: 'var(--warn-dim)' },
        daily:  { DEFAULT: 'var(--daily)', dim: 'var(--daily-dim)' },
        note:   { DEFAULT: 'var(--note)', dim: 'var(--note-dim)' },
      },
      animation: {
        'pop':        'pop 0.16s cubic-bezier(0.34,1.6,0.64,1) both',
        'shake':      'shake 0.35s ease both',
        'fade-in':    'fadeIn 0.18s ease both',
        'slide-up':   'slideUp 0.22s cubic-bezier(0.34,1.4,0.64,1) both',
        'ripple':     'ripple 0.5s ease-out both',
        'celebrate':  'celebrate 0.6s cubic-bezier(0.34,1.6,0.64,1) both',
        'lock-flash': 'lockFlash 0.55s ease-out both',
        'digit-done': 'digitDone 0.4s cubic-bezier(0.34,1.6,0.64,1) both',
      },
      keyframes: {
        pop:       { '0%': { transform: 'scale(0.8)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        shake:     { '0%,100%': { transform: 'translateX(0)' }, '20%': { transform: 'translateX(-5px)' }, '60%': { transform: 'translateX(5px)' } },
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { transform: 'translateY(16px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        ripple:    { from: { transform: 'scale(0.6)', opacity: '0.6' }, to: { transform: 'scale(1.4)', opacity: '0' } },
        celebrate: { '0%': { transform: 'scale(0.7) rotate(-5deg)', opacity: '0' }, '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' } },
        // lockFlash uses CSS var — defined in index.css
        lockFlash: { '0%': { backgroundColor: 'rgba(var(--ok-rgb),0.35)' }, '60%': { backgroundColor: 'rgba(var(--ok-rgb),0.12)' }, '100%': { backgroundColor: 'rgba(var(--ok-rgb),0)' } },
        digitDone: { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.18)' }, '100%': { transform: 'scale(1)' } },
      },
      boxShadow: {
        'glow-accent': '0 0 20px rgba(var(--accent-rgb),0.4)',
        'glow-ok':     '0 0 20px rgba(var(--ok-rgb),0.3)',
      },
    },
  },
  plugins: [],
};
