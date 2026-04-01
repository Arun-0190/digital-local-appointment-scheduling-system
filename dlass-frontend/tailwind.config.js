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
        primary: "#6366F1", // Indigo 500
        secondary: "#3B82F6", // Blue 500
        accent: "#10B981", // Emerald 500
        rose: "#F43F5E", // Rose 500
        amber: "#F59E0B", // Amber 500
        coral: "#F43F5E", // Rose 500 (alias)
        "deep-navy": "#0F172A", // Slate 900
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
        headline: ["Poppins", "Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
        label: ["Inter", "sans-serif"],
      },
      borderRadius: {
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)',
      }
    },
  },
  plugins: [],
};
