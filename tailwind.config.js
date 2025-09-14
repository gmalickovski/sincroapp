// Em tailwind.config.js

/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme'; // Importe o tema padrão

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Adiciona a fonte serifada, usando as fontes padrão do sistema
        serif: ['Georgia', ...defaultTheme.fontFamily.serif],
      },
    },
  },
  plugins: [],
}