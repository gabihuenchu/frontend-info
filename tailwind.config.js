/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colores del branding CatástrofesCL
        'verde-oscuro': '#2B3210',
        'blanco-cremoso': '#FBF8EF',
        'rojo-catastrofe': '#DE6E27',
        'azul-grisaceo': '#E5E2D9',
        'verde-oliva': '#505631',
      },
      fontFamily: {
        'intro-rust': ['Intro Rust', 'sans-serif'],
        'vertical-serif': ['Vertical Serif', 'serif'],
        'helvetica-now': ['Helvetica Now', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
