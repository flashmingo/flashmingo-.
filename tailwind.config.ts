import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sakura: {
          50: '#fdf8f7',
          100: '#fbe8e5',
          200: '#f8c3d3',
          300: '#f5a3be',
          400: '#f27fa6',
          500: '#f05b8f',
          600: '#d63d70',
          700: '#b82e59',
          800: '#8c1f42',
          900: '#5a132b',
        },
        sage: {
          50: '#f5f9f7',
          100: '#e8f4ed',
          200: '#a8d8c2',
          300: '#7ecdb1',
          400: '#54c2a0',
          500: '#2bb78f',
          600: '#1fa078',
          700: '#178960',
          800: '#116b49',
          900: '#0b4d32',
        },
        indigo: {
          50: '#f5f7fb',
          100: '#e8eff7',
          200: '#c5d9ed',
          300: '#a1c3e3',
          400: '#7dadc9',
          500: '#5997af',
          600: '#3a4f6b',
          700: '#2e3f56',
          800: '#222f41',
          900: '#161f2b',
        },
      },
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      },
      fontSize: {
        xs: '0.875rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      lineHeight: {
        relaxed: '1.5',
        loose: '1.75',
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(58, 79, 107, 0.05)',
        md: '0 4px 6px -1px rgba(58, 79, 107, 0.1)',
        lg: '0 10px 15px -3px rgba(58, 79, 107, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
