/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Royal Blue & Sapphire Palette
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#3B82F6',
          500: '#2563EB', // Royal Blue
          600: '#1D4ED8', // Deep Royal Blue
          700: '#1E40AF', // Classic Regal Royal Blue
          800: '#1E3A8A', // Deep Royal Navy
          900: '#172554', // Midnight Royal
          950: '#0B1536',
        },
        // Subtle Linear/Modern SaaS Violet Accents
        violet: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
          950: '#2E1065',
        },
        // Soft Neutral / Warm Linen Surfaces
        beige: {
          50: '#FAF8F5',  // Ivory cream canvas
          100: '#F5F0E8', // Warm linen surface
          200: '#EFE7DA', // Soft oatmeal border
          300: '#E2D6C3', // Warm sand
          400: '#C9B69B', // Muted camel
          500: '#B09B7D', // Classic beige
          600: '#8F795E', // Warm earth
          700: '#6F5C45',
          800: '#4E4030',
          900: '#30271D',
          950: '#1C160F',
        },
        // Deep Navy / Midnight Dark Theme (Linear-inspired)
        dark: {
          bg: '#080D1A',       // Deepest royal midnight canvas
          surface: '#0F172E',  // Royal surface
          card: '#152244',     // Elevated royal card
          cardHover: '#1A2B54',
          border: '#1E3360',   // Refined royal border
          borderLight: '#2A447E',
          muted: '#94A3B8',
          beige: '#F5EFEB',    // Warm contrast text
          beigeMuted: '#D5C8B4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 25px -4px rgba(37, 99, 235, 0.35)',
        'glow-violet': '0 0 25px -4px rgba(139, 92, 246, 0.35)',
        'glow-lg': '0 0 35px -5px rgba(30, 64, 175, 0.45)',
        'beige': '0 4px 20px -2px rgba(176, 155, 125, 0.15)',
        'royal': '0 10px 30px -10px rgba(30, 64, 175, 0.4)',
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
