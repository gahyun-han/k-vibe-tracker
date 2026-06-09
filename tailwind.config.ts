import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // K-Vibe 브랜드 팔레트
        primary:   { DEFAULT: '#FF3A5C', light: '#FF6B8A', dark: '#CC2847' },
        secondary: { DEFAULT: '#1A1A2E', light: '#252540', dark: '#0D0D1A' },
        accent:    { DEFAULT: '#F5C518' },
        kvibe: {
          bg:       '#0D0D1A',
          surface:  '#1E1E30',
          surface2: '#252540',
          border:   '#2E2E4A',
          muted:    '#8B8BA8',
        },
      },
      fontFamily: {
        sans: ['var(--font-noto)', 'Noto Sans KR', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(100%)' },
          to:   { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
