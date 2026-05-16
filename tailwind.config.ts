import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Design baseline (design/2026_uyum/shared/tailwind.config.js)
        'uyum-dark':       '#320E3B',
        'uyum-purple':     '#4C2A85',
        'uyum-blue':       '#6B7FD7',
        'uyum-frost-blue': '#BCEDF6',
        'uyum-frost-mint': '#DDFBD2',

        // A11y boyut renkleri — CLAUDE.md sabit karari, design folder kapsami disi
        a11y: {
          verified: '#16a34a',
          partial:  '#eab308',
          none:     '#dc2626',
          unknown:  '#6b7280',
        },
        focus: {
          ring: '#4C2A85',
        },
      },
      fontFamily: {
        sans:    ['Inter',  'system-ui', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
        body:    ['Inter',  'sans-serif'],
      },
    },
  },
  plugins: [
    // A2 — high-contrast variant: use `hc:` prefix on any utility
    // AccessibilityContext sets html.high-contrast when enabled
    plugin(({ addVariant }) => {
      addVariant('hc', 'html.high-contrast &')
    }),
  ],
} satisfies Config
