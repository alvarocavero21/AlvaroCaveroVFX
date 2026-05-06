"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

// base hue 200 (cyan-blue), spread 60 — yields #60a5fa-style light-blue glow
const COLOR_MAP: Record<string, string> = {
  blue:  "96, 165, 250",   // #60a5fa
  gold:  "200, 169, 110",  // site gold
  white: "255, 255, 255",
};

export interface SpotlightCardProps {
  children: React.ReactNode;
  glowColor?: "blue" | "gold" | "white";
  customSize?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function SpotlightCard({
  children,
  glowColor = "blue",
  customSize = false,
  className,
  style,
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const { left, top } = el.getBoundingClientRect();
    el.style.setProperty("--sx", `${e.clientX - left}px`);
    el.style.setProperty("--sy", `${e.clientY - top}px`);
  };

  const onLeave = () => {
    ref.current?.style.setProperty("--sx", "-9999px");
    ref.current?.style.setProperty("--sy", "-9999px");
  };

  const rgb = COLOR_MAP[glowColor] ?? COLOR_MAP.blue;

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn(
        "relative overflow-hidden",
        !customSize && "rounded-xl",
        className,
      )}
      style={{ "--sx": "-9999px", "--sy": "-9999px", ...style } as React.CSSProperties}
    >
      {/* Spotlight glow — rendered first so children paint on top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle 300px at var(--sx) var(--sy), rgba(${rgb}, 0.14) 0%, transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
}
