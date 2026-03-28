/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#0A0A14',
        plasma: '#7B61FF',
        ghost: '#F0EFF4',
        graphite: '#18181B',
        mist: '#C8C4DA',
        emerald: '#59D98E',
      },
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        serif: ['Instrument Serif', 'serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        aura: '0 30px 90px rgba(8, 8, 20, 0.35)',
        panel: '0 24px 60px rgba(8, 8, 20, 0.28)',
      },
      transitionTimingFunction: {
        magnetic: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
    },
  },
  plugins: [],
};
