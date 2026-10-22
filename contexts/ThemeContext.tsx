"use client";

import { useSyncExternalStore } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

// The source of truth is the `light` class on <html>, set before first paint by the inline script
// in app/layout.tsx. Reading it through useSyncExternalStore (server snapshot = "dark") makes every
// component hydrate with the server value and then re-render with the real one. A plain context
// state broke this: sections loaded with next/dynamic hydrate later, after the provider had already
// switched to "light", so React hydrated them with mismatched classNames and never patched them.
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

const getSnapshot = (): Theme =>
  document.documentElement.classList.contains("light") ? "light" : "dark";

const getServerSnapshot = (): Theme => "dark";

function toggleTheme() {
  const next: Theme = getSnapshot() === "dark" ? "light" : "dark";
  try { localStorage.setItem("theme", next); } catch { /* storage blocked (Safari private mode) */ }
  document.documentElement.classList.toggle("light", next === "light");
  listeners.forEach((l) => l());
}

export function useTheme(): ThemeContextValue {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { theme, toggleTheme };
}
