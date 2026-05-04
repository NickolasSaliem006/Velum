import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Velum brand: Obsidian + Bone
        obsidian: {
          DEFAULT: '#0D0D0D',
          50: '#1A1A1A',
          100: '#262626',
          200: '#333333',
        },
        bone: {
          DEFAULT: '#F5F0E8',
          50: '#FDFAF6',
          100: '#F9F5EF',
          200: '#EDE7D9',
        },
        accent: {
          DEFAULT: '#7C6FCD',
          hover: '#6A5FBE',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
