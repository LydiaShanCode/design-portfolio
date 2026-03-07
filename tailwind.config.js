/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Geist', 'system-ui', 'sans-serif'],
        'heading': ['Cormorant Garamond', 'serif'],
        'mono': ['Geist Mono', 'Courier New', 'monospace'],
      },
      colors: {
        primary: 'var(--color-primary)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          dark: 'var(--color-surface-dark)',
          code: 'var(--color-surface-code)',
        },
        muted: 'var(--color-text-muted)',
        placeholder: 'var(--color-text-placeholder)',
        faint: 'var(--color-text-faint)',
      },
      maxWidth: {
        content: 'var(--max-w-content)',
        modal: 'var(--max-w-modal)',
        postcard: 'var(--max-w-postcard)',
      },
      transitionTimingFunction: {
        smooth: 'var(--ease-smooth)',
        dramatic: 'var(--ease-dramatic)',
      },
    },
  },
  plugins: [],
}
