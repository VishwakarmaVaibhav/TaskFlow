/** @type {import('tailwindcss').Config} */

/*
  ┌─────────────────────────────────────────────────────┐
  │  THEME COLOR MAP                                    │
  │  These hex values match the CSS variables in        │
  │  src/index.css. To retheme the app:                 │
  │    1. Change hex values HERE                        │
  │    2. Update matching vars in index.css :root       │
  │  Both must stay in sync.                            │
  └─────────────────────────────────────────────────────┘
*/

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#eef4fb',
          100: '#dbe9f8',
          500: '#2a5080',
          600: '#1e3a5f',
          700: '#15304f',
        },
        success: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          500: '#16a34a',
          600: '#15803d',
        },
        alert: {
          50:  '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
        },
        warning: {
          50:  '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
        },
        canvas:       '#f1f5f9',
        card:         '#ffffff',
        'card-hover': '#f8fafc',
        'muted-bg':   '#e2e8f0',
        ink: {
          900:   '#0f172a',
          700:   '#334155',
          500:   '#64748b',
          400:   '#94a3b8',
          300:   '#cbd5e1',
          white: '#ffffff',
        },
        line:         '#e2e8f0',
        'line-light': '#f1f5f9',
      },
      borderRadius: {
        card:  '16px',
        btn:   '10px',
        input: '10px',
        pill:  '9999px',
      },
      boxShadow: {
        card:         '0 1px 3px rgba(15,23,42,0.05), 0 4px 14px rgba(15,23,42,0.05)',
        'card-hover': '0 4px 12px rgba(15,23,42,0.08), 0 8px 28px rgba(15,23,42,0.07)',
        nav:          '0 1px 3px rgba(15,23,42,0.06)',
        modal:        '0 20px 60px rgba(15,23,42,0.18)',
        input:        '0 1px 2px rgba(15,23,42,0.06)',
        focus:        '0 0 0 3px rgba(42,80,128,0.2)',
      },
      animation: {
        'fade-up': 'fadeUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in': 'fadeIn 0.35s ease forwards',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
