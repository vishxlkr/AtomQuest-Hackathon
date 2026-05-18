module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./context/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0a0a0f",
        surface: "#111118",
        card: "#16161f",
        hover: "#1c1c28",
        "border-soft": "rgba(255,255,255,0.06)",
        primary: "#6366f1",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
