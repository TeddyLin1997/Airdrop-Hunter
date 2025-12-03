/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: [
    'bg-up',
    'bg-down',
    'bg-primary',
    'bg-up-extend',
    'bg-down-extend',
    'bg-primary-extend',
    'text-up',
    'text-down',
    'text-primary',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          gold: "#F0B90B",
          'gold-light': "#FFD43B",
          'gold-mid': "#E5AC00",
          'gold-dark': "#B8860B",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom colors moved here to avoid duplication and incorrect placement
        '1': '#71757A', // Renamed to string key for consistency
        dark: '#1A1A1F',
        mid: '#71757A',
        light: '#A0A4A8',
        gold: {
          DEFAULT: '#F0B90B',
          light: '#FFD43B',
          mid: '#E5AC00',
          dark: '#B8860B',
        },
        neutral: {
          black: '#08080A',
          'black-light': '#0B0B0E',
          'gray-dark': '#1A1A1F',
          'gray-mid': '#71757A',
          'gray-light': '#A0A4A8',
        },
        semantic: {
          success: '#10B981',
          error: '#EF4444',
          warning: '#F59E0B',
          info: '#3B82F6',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fade-in-up": {
          "0%": { transform: "translate(-50%, -30%) scale(0.1)" },
          "100%": { transform: "translate(-50%, -100%) scale(1)" },
        },
        tick: {
          to: { backgroundColor: 'transparent' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.25s ease-in-out forwards",
        tick: "tick 0.6s linear forwards",
      },
      boxShadow: {
        DEFAULT: 'rgba(88, 102, 126, 0.08) 0px 4px 24px, rgba(88, 102, 126, 0.12) 0px 1px 2px',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #F0B90B 0%, #FFD43B 50%, #E5AC00 100%)',
        'gold-gradient-hover': 'linear-gradient(135deg, #FFD43B 0%, #F0B90B 50%, #E5AC00 100%)',
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontWeight: {
        bold: 700,
        medium: 500,
        regular: 400,
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
