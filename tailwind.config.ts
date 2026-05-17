import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

/**
 * UYUM Faz 12 design system bridge.
 *
 * Skeleton (design/2026_uyum) ships Tailwind v4 with `@theme inline` + oklch CSS
 * variables. We stay on Tailwind v3 and surface the same tokens via Tailwind
 * color names that map onto CSS variables declared in src/styles/globals.css.
 *
 * Result: components can use `bg-background`, `text-primary`, `bg-mint/60`, etc.
 * exactly like the skeleton, while existing `uyum-*` aliases keep building.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Faz 12 design system — CSS variable backed (see globals.css)
        background:         'var(--color-background)',
        foreground:         'var(--color-foreground)',
        card: {
          DEFAULT:          'var(--color-card)',
          foreground:       'var(--color-card-foreground)',
        },
        popover: {
          DEFAULT:          'var(--color-popover)',
          foreground:       'var(--color-popover-foreground)',
        },
        primary: {
          DEFAULT:          'var(--color-primary)',
          foreground:       'var(--color-primary-foreground)',
          deep:             'var(--color-primary-deep)',
        },
        secondary: {
          DEFAULT:          'var(--color-secondary)',
          foreground:       'var(--color-secondary-foreground)',
        },
        muted: {
          DEFAULT:          'var(--color-muted)',
          foreground:       'var(--color-muted-foreground)',
        },
        accent: {
          DEFAULT:          'var(--color-accent)',
          foreground:       'var(--color-accent-foreground)',
        },
        mint: {
          DEFAULT:          'var(--color-mint)',
          foreground:       'var(--color-mint-foreground)',
        },
        sky: {
          DEFAULT:          'var(--color-sky)',
          foreground:       'var(--color-sky-foreground)',
        },
        destructive: {
          DEFAULT:          'var(--color-destructive)',
          foreground:       'var(--color-destructive-foreground)',
        },
        success:            'var(--color-success)',
        warning:            'var(--color-warning)',
        border:             'var(--color-border)',
        input:              'var(--color-input)',
        ring:               'var(--color-ring)',

        // Faz 0-11 legacy aliases — preserved while pages migrate
        'uyum-dark':        '#320E3B',
        'uyum-purple':      '#4C2A85',
        'uyum-blue':        '#6B7FD7',
        'uyum-frost-blue':  '#BCEDF6',
        'uyum-frost-mint':  '#DDFBD2',

        // A11y dimension colors — locked decision (CLAUDE.md §3)
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
        sans:    ['"Schibsted Grotesk"', 'system-ui', 'sans-serif'],
        body:    ['"Schibsted Grotesk"', 'system-ui', 'sans-serif'],
        display: ['"Schibsted Grotesk"', 'system-ui', 'sans-serif'],
        heading: ['"Schibsted Grotesk"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm:   '0.5rem',
        md:   '0.75rem',
        lg:   '1.25rem',
        xl:   '1.75rem',
        '2xl': '2.25rem',
        '3xl': '3rem',
      },
      boxShadow: {
        soft: '0 4px 16px -4px oklch(0.22 0.12 305 / 0.08)',
        card: '0 10px 30px -12px oklch(0.22 0.12 305 / 0.18)',
        glow: '0 20px 60px -20px oklch(0.38 0.16 295 / 0.45)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #4C2A85 0%, #6B7FD7 100%)',
        'gradient-deep':  'linear-gradient(135deg, #320E3B 0%, #4C2A85 100%)',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
      },
    },
  },
  plugins: [
    // A2 — high-contrast variant: `hc:` prefix
    plugin(({ addVariant }) => {
      addVariant('hc', 'html.high-contrast &')
    }),
  ],
} satisfies Config
