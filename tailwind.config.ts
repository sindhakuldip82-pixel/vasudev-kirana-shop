import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f1faf1',
          100: '#dcf2dd',
          200: '#bce4bf',
          300: '#8ecf93',
          400: '#5cb264',
          500: '#38953f', // primary green
          600: '#297831',
          700: '#215f29',
          800: '#1e4c23',
          900: '#193f1e',
        },
        accent: {
          500: '#f5a623', // offer/badge orange
        },
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'Noto Sans Gujarati', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 10px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
