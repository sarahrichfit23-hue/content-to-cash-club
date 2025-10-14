import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        background: "#fffdf7",
        foreground: "#2e2b26",

        primary: {
          DEFAULT: "#e4b363", // warm gold
          foreground: "#2e2b26",
        },
        accent: {
          DEFAULT: "#c97b63", // soft clay tone
          foreground: "#fffdf7",
        },
        highlight: "#ffeecf",
        muted: "#f6f2ea",
        border: "#e7dfd3",
        card: {
          DEFAULT: "#fffaf1",
          foreground: "#2e2b26",
        },
      },
      fontFamily: {
        sans: ['Karla', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        xl: "10px",
        lg: "8px",
        md: "6px",
        sm: "4px",
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'scale(0.98)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        shimmer: 'shimmer 6s ease-in-out infinite',
        fadeIn: 'fadeIn 0.6s ease forwards',
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#2e2b26',
            a: {
              color: '#c97b63',
              '&:hover': { color: '#e4b363' },
            },
            h1: { fontFamily: 'Playfair Display, serif' },
            h2: { fontFamily: 'Playfair Display, serif' },
            h3: { fontFamily: 'Playfair Display, serif' },
          },
        },
      },
    },
  },
  plugins: [
    animate,
    typography,
  ],
} satisfies Config;
