/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        bg: {
          base: "#0a0e1a",
          surface: "#0f1525",
          elevated: "#141c30",
          border: "#1e2a45",
        },
        brand: {
          cyan: "#00e5ff",
          blue: "#4f8ef7",
          violet: "#7b5ea7",
          green: "#00c896",
        },
        text: {
          primary: "#e8edf5",
          secondary: "#8a9ab5",
          muted: "#4a5568",
        },
      },
      boxShadow: {
        glow: "0 0 20px rgba(0, 229, 255, 0.15)",
        "glow-sm": "0 0 10px rgba(0, 229, 255, 0.1)",
        panel: "0 4px 24px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};
