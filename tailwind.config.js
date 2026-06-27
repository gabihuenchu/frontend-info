/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      spacing: {
        'ds-1': '4px',
        'ds-2': '8px',
        'ds-3': '12px',
        'ds-4': '16px',
        'ds-5': '24px',
        'ds-6': '32px',
      },
      borderRadius: {
        card: '12px',
        control: '8px',
      },
      colors: {
        brand: {
          DEFAULT: '#2E7D32',
          hover: '#256728',
          dark: '#166534',
          light: '#DCFCE7',
          active: '#BBF7D0',
        },
        surface: {
          page: '#F8FAFC',
          sidebar: '#F4F7F4',
          card: '#FFFFFF',
          hover: '#EEF2EE',
          subnav: '#E8EFE8',
          'table-head': '#F3F4F6',
          'nav-active': '#DCFCE7',
        },
        content: {
          primary: '#111827',
          secondary: '#4B5563',
          tertiary: '#6B7280',
          placeholder: '#9CA3AF',
          label: '#6B7280',
          'table-head': '#374151',
        },
        border: {
          DEFAULT: '#D1D5DB',
          card: '#E5E7EB',
          focus: '#2E7D32',
        },
        semantic: {
          error: '#DC2626',
          warning: '#D97706',
          success: '#16A34A',
        },
        state: {
          alta: { bg: '#FEE2E2', text: '#B91C1C' },
          media: { bg: '#FEF3C7', text: '#B45309' },
          baja: { bg: '#DCFCE7', text: '#166534' },
          urgente: { bg: '#FEF2F2', text: '#B91C1C' },
        },
        'verde-oscuro': '#2B3210',
        'blanco-cremoso': '#FBF8EF',
        'rojo-catastrofe': '#DE6E27',
        'azul-grisaceo': '#E5E2D9',
        'verde-oliva': '#505631',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.05)',
        sidebar: '2px 0 8px rgba(0, 0, 0, 0.04)',
        focus: '0 0 0 3px rgba(46, 125, 50, 0.15)',
      },
      fontWeight: {
        title: '600',
        subtitle: '500',
      },
      fontFamily: {
        'intro-rust': ['Intro Rust', 'sans-serif'],
        'vertical-serif': ['Vertical Serif', 'serif'],
        'helvetica-now': ['Helvetica Now', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
