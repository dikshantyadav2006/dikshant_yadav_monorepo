import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        foreground: 'var(--text)',
        muted: 'var(--border)',
      },
      fontFamily: {
        display: ['font-p-1', 'sans-serif'],
        script: ['playground', 'cursive'],
        sans: ['font-p-3', 'system-ui', 'sans-serif'],
        mono: ['font-p-2', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
