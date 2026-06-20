import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:      '#0A0E1A',
        card:    '#111827',
        card2:   '#0F1520',
        green:   '#00FF88',
        greendim:'#00cc6a',
        blue:    '#3B82F6',
        gray2:   '#4B5563',
        red:     '#EF4444',
        gold:    '#F59E0B',
      },
      fontFamily: {
        rajdhani: ['Rajdhani', 'sans-serif'],
        mono:     ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
