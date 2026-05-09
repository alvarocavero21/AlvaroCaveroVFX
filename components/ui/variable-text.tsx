"use client";

import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

// ── useActiveSection ──────────────────────────────────────────────────────────
// Subscribes to snap-section events from SnapScrollContainer.
// Returns the current active section index (0 = Hero, 1 = Showreel, …).

export function useActiveSection(): number {
  const [section, setSection] = useState(0);

  useEffect(() => {
    const handler = (e: Event) =>
      setSection((e as CustomEvent<number>).detail);

    // snap-section fires on every goTo() inside SnapScrollContainer
    window.addEventListener("snap-section", handler);
    return () => window.removeEventListener("snap-section", handler);
  }, []);

  return section;
}

// ── WeightPulse ───────────────────────────────────────────────────────────────
// Wraps children in a span that loops a slow font-weight pulse.
// font-variation-settings inherits, so all Inter text inside will pulse.
// The CSS @keyframes "weight-pulse" must be declared in globals.css.

interface WeightPulseProps {
  children: ReactNode;
  duration?: number;      // seconds for one full pulse cycle (default 3)
  from?: number;          // min wght value (default 300)
  to?: number;            // max wght value (default 600)
  startDelay?: number;    // seconds before the loop begins (default 0)
  className?: string;
  style?: CSSProperties;
}

export function WeightPulse({
  children,
  duration = 3,
  startDelay = 0,
  className,
  style,
}: WeightPulseProps) {
  return (
    <span
      className={className}
      style={{
        display: "inline",
        fontVariationSettings: "'wght' 300",
        animation: `weight-pulse ${duration}s ease-in-out ${startDelay}s infinite`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
