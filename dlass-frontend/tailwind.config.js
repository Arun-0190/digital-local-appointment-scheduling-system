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
        primary: "#14b8a6", // Teal
        secondary: "#22d3ee", // Cyan
        coral: "#fb7185",
        "deep-navy": "#0f172a",
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
        headline: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
        label: ["Inter", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(to right, #14b8a6, #22d3ee)',
      }
    },
  },
  plugins: [],
};
