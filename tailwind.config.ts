import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // TEMP: brand renkleri design/ klasoru dolduktan sonra migrate edilecek (Faz 10)
        brand: {
          primary: '#0ea5e9',
          accent:  '#10b981',
          dark:    '#0c4a6e',
          light:   '#ecfeff',
        },
        a11y: {
          verified: '#16a34a',
          partial:  '#eab308',
          none:     '#dc2626',
          unknown:  '#6b7280',
        },
        focus: {
          ring: '#0ea5e9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
