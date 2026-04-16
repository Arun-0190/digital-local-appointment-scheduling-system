/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FFBF00", // Gold
          light: "#ffe2a9",
          dark: "#fabd00",
        },
        secondary: {
          DEFAULT: "#262626",
          light: "#3a3939",
          dark: "#1c1b1b",
        },
        accent: "#FF8F00", // Amber
        background: "#0D0D0D",
        surface: "var(--bg-surface)",
        textPrimary: "var(--text-primary)",
        textSecondary: "var(--text-secondary)",
        glassBg: "var(--glass-bg)",
        glassBorder: "var(--glass-border)",
        cardHover: "var(--card-hover)",
        inputBg: "var(--input-bg)",
        inputBorder: "var(--input-border)",
      },
      fontFamily: {
        headline: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
        label: ["Inter", "sans-serif"],
      },
      borderRadius: {
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #FFC107 0%, #FF8F00 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
      },
      animation: {
        'gradient-x': 'gradient-x 5s ease infinite',
        'pulse-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
        },
      },
    },
  },
  plugins: [],
};
