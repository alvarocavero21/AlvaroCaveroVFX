"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        borderRadius: 99,
        border: "1px solid var(--border-gold-faint)",
        background: "var(--bg-secondary)",
        color: "var(--accent)",
        transition: "background 0.4s ease, border-color 0.4s ease, color 0.4s ease",
        cursor: "pointer",
      }}
    >
      {isLight ? (
        <Moon size={13} strokeWidth={1.6} />
      ) : (
        <Sun size={13} strokeWidth={1.6} />
      )}
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 9,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
        }}
      >
        {isLight ? "Dark" : "Light"}
      </span>
    </button>
  );
}
