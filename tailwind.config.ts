import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:        "var(--bg-primary)",
        "bg-2":    "var(--bg-secondary)",
        "bg-3":    "var(--bg-tertiary)",
        gold:      "rgb(var(--accent-rgb))",
        "gold-dim": "rgb(var(--accent-rgb))",
        muted:     "var(--text-muted)",
        primary:   "var(--text-primary)",
      },
      fontFamily: {
        bebas: ["'Bebas Neue'", "sans-serif"],
        inter: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
