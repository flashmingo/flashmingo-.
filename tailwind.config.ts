import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: { center: true, padding: '2rem', screens: { '2xl': '1400px' } },
    extend: {
      colors: {
        border:     'hsl(var(--border))',
        input:      'hsl(var(--input))',
        ring:       'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary:     { DEFAULT: 'hsl(var(--primary))',     foreground: 'hsl(var(--primary-foreground))' },
        secondary:   { DEFAULT: 'hsl(var(--secondary))',   foreground: 'hsl(var(--secondary-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        muted:       { DEFAULT: 'hsl(var(--muted))',       foreground: 'hsl(var(--muted-foreground))' },
        accent:      { DEFAULT: 'hsl(var(--accent))',      foreground: 'hsl(var(--accent-foreground))' },
        popover:     { DEFAULT: 'hsl(var(--popover))',     foreground: 'hsl(var(--popover-foreground))' },
        card:        { DEFAULT: 'hsl(var(--card))',        foreground: 'hsl(var(--card-foreground))' },
        sidebar: {
          DEFAULT:              'hsl(var(--sidebar-background))',
          foreground:           'hsl(var(--sidebar-foreground))',
          primary:              'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent:               'hsl(var(--sidebar-accent))',
          'accent-foreground':  'hsl(var(--sidebar-accent-foreground))',
          border:               'hsl(var(--sidebar-border))',
          ring:                 'hsl(var(--sidebar-ring))',
        },
        chart: {
          '1': 'hsl(var(--chart-1))', '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))', '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },

      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'Menlo', 'monospace'],
      },

      /* 8px grid */
      borderRadius: {
        sm:    '4px',
        md:    '6px',
        lg:    '8px',
        xl:    '10px',
        '2xl': '12px',
        '3xl': '16px',
      },

      boxShadow: {
        'xs':    '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        'sm':    '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'md':    '0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
        'lg':    '0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
        'card':  '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 12px -2px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
        'flashcard': '0 8px 24px -4px rgb(0 0 0 / 0.08), 0 2px 6px -2px rgb(0 0 0 / 0.06)',
      },

      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up':   { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'fade-in':        { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'fade-in-up':     { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'fade-out':       { from: { opacity: '1' }, to: { opacity: '0' } },
        'scale-in':       { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
        'card-flip':      { '0%': { transform: 'rotateY(0deg)' }, '100%': { transform: 'rotateY(180deg)' } },
        shimmer:          { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        /* Landing-page hero flashcard */
        'fm-flip':        { '0%,40%': { transform: 'rotateY(0deg)' }, '50%,90%': { transform: 'rotateY(180deg)' }, '100%': { transform: 'rotateY(0deg)' } },
        'fm-float':       { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-7px)' } },
        'fm-marquee':     { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        'fm-pulse-ring':  { '0%': { transform: 'scale(0.9)', opacity: '0.6' }, '100%': { transform: 'scale(2.4)', opacity: '0' } },
        'fm-aurora':      { '0%,100%': { transform: 'translate(0,0) scale(1)' }, '33%': { transform: 'translate(6%,-4%) scale(1.1)' }, '66%': { transform: 'translate(-5%,5%) scale(0.95)' } },
        'fm-spin':        { to: { transform: 'rotate(360deg)' } },
        'fm-grid':        { '0%': { transform: 'translateY(0)' }, '100%': { transform: 'translateY(22px)' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'fade-in':        'fade-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-up':     'fade-in-up 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-out':       'fade-out 0.15s ease-in',
        'scale-in':       'scale-in 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        'card-flip':      'card-flip 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        shimmer:          'shimmer 1.8s linear infinite',
        'fm-flip':        'fm-flip 8s ease-in-out infinite',
        'fm-float':       'fm-float 6s ease-in-out infinite',
        'fm-marquee':     'fm-marquee 38s linear infinite',
        'fm-pulse-ring':  'fm-pulse-ring 2.4s cubic-bezier(0.16,1,0.3,1) infinite',
        'fm-aurora':      'fm-aurora 18s ease-in-out infinite',
        'fm-aurora-slow': 'fm-aurora 26s ease-in-out infinite',
        'fm-spin':        'fm-spin 6s linear infinite',
        'fm-grid':        'fm-grid 4s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
