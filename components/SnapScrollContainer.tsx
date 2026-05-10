"use client";

import { useCallback, useEffect, useRef, useState, Children } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const DURATION = 800;
const EASING   = "cubic-bezier(0.76, 0, 0.24, 1)";

// Single source of truth — dots and TOTAL are ALWAYS derived from here
const SECTIONS = [
  { name: "Hero"     },
  { name: "Showreel" },
  { name: "Work"     },
  { name: "Contact"  },
] as const;
const TOTAL = SECTIONS.length; // 4 — immutable

// ── Per-dot component ─────────────────────────────────────────────────────────
function NavDot({
  isActive,
  isLight,
  name,
  onClick,
}: {
  isActive: boolean;
  isLight: boolean;
  name: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
      <span
        style={{
          position: "absolute",
          right: "calc(100% + 12px)",
          fontSize: 9,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          fontFamily: "Inter, sans-serif",
          color: isActive
            ? "var(--accent)"
            : isLight ? "rgba(26,26,26,0.5)" : "rgba(255,255,255,0.45)",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateX(0)" : "translateX(8px)",
          fontVariationSettings: isActive ? "'wght' 700" : hovered ? "'wght' 500" : "'wght' 300",
          transition: "opacity 0.25s ease, transform 0.25s ease, font-variation-settings 0.3s ease",
        }}
      >
        {name}
      </span>

      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={`Go to ${name}`}
        style={{
          width:  isActive ? 10 : hovered ? 8 : 6,
          height: isActive ? 10 : hovered ? 8 : 6,
          borderRadius: "50%",
          background: isActive
            ? "var(--accent)"
            : hovered
            ? "rgba(var(--accent-rgb), 0.55)"
            : isLight ? "rgba(26,26,26,0.22)" : "rgba(255,255,255,0.28)",
          border: "none",
          padding: 0,
          outline: "none",
          cursor: "pointer",
          transition: "all 0.35s cubic-bezier(0.23,1,0.32,1)",
          animation: isActive ? "dot-pulse 2.2s ease-in-out infinite" : "none",
          boxShadow: isActive ? "0 0 10px rgba(var(--accent-rgb),0.5)" : "none",
        }}
      />
    </div>
  );
}

// ── Main container ────────────────────────────────────────────────────────────
export default function SnapScrollContainer({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState(0);
  const { theme } = useTheme();
  const isLight       = theme === "light";
  const transitioning = useRef(false);
  const currentRef    = useRef(0);
  const touchStartY   = useRef(0);

  const goTo = useCallback((next: number) => {
    if (next < 0 || next >= TOTAL) return;
    if (next === currentRef.current) return;
    transitioning.current = true;
    currentRef.current    = next;
    setCurrent(next);
    window.dispatchEvent(new CustomEvent("snap-section", { detail: next }));
    setTimeout(() => { transitioning.current = false; }, DURATION + 100);
  }, []);

  // Prevent browser scroll-restoration from showing a section other than Hero on reload
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      // Let internally-scrollable elements (e.g. Projects card list) scroll first
      const target = e.target as HTMLElement;
      let el: HTMLElement | null = target;
      while (el && el !== document.body) {
        const s = window.getComputedStyle(el);
        const isScrollable =
          (s.overflowY === "auto" || s.overflowY === "scroll") &&
          el.scrollHeight > el.clientHeight;
        if (isScrollable) {
          if (e.deltaY < 0 && el.scrollTop > 0) return;
          if (e.deltaY > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 2) return;
        }
        el = el.parentElement;
      }
      e.preventDefault();
      if (transitioning.current) return;
      if (e.deltaY > 0) goTo(currentRef.current + 1);
      else              goTo(currentRef.current - 1);
    };

    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown"].includes(e.key)) { e.preventDefault(); goTo(currentRef.current + 1); }
      if (["ArrowUp",   "PageUp"  ].includes(e.key)) { e.preventDefault(); goTo(currentRef.current - 1); }
    };

    const onTouchStart = (e: TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
    const onTouchEnd   = (e: TouchEvent) => {
      if (transitioning.current) return;
      const d = touchStartY.current - e.changedTouches[0].clientY;
      if      (d >  50) goTo(currentRef.current + 1);
      else if (d < -50) goTo(currentRef.current - 1);
    };

    const onGoto = (e: Event) => {
      transitioning.current = false;
      goTo((e as CustomEvent<number>).detail);
    };

    window.addEventListener("wheel",      onWheel,      { passive: false });
    window.addEventListener("keydown",    onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend",   onTouchEnd,   { passive: true });
    window.addEventListener("snap-goto",  onGoto);

    return () => {
      window.removeEventListener("wheel",      onWheel);
      window.removeEventListener("keydown",    onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend",   onTouchEnd);
      window.removeEventListener("snap-goto",  onGoto);
    };
  }, [goTo]);

  // Collect panels — all 4 children; each gets its own 100vh slot in the strip
  const panels = Children.toArray(children);

  return (
    <>
      {/*
        Outer window: fixed, clips to viewport.
        Inner strip: all sections stacked top-to-bottom (total height = TOTAL × 100vh).
        Navigation = translateY(-current × 100vh) on the inner strip.
        No z-index fighting, no stacking context issues — every section is always in the DOM.
      */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden" }}>
        <div
          style={{
            width: "100%",
            transform: `translateY(-${current * 100}vh)`,
            transition: `transform ${DURATION}ms ${EASING}`,
            willChange: "transform",
          }}
        >
          {panels.map((panel, i) => (
            <div
              key={i}
              style={{ width: "100%", height: "100vh", overflow: "hidden", position: "relative" }}
            >
              {panel}
            </div>
          ))}

          {/* Padding slots if somehow fewer than TOTAL children are passed */}
          {Array.from({ length: Math.max(0, TOTAL - panels.length) }).map((_, i) => (
            <div key={`pad-${i}`} style={{ width: "100%", height: "100vh" }} />
          ))}
        </div>
      </div>

      {/* Navigation dots — always exactly TOTAL, driven by SECTIONS constant, never by panels */}
      <nav
        aria-label="Section navigation"
        style={{
          position: "fixed",
          right: 24,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 16,
        }}
      >
        {SECTIONS.map(({ name }, i) => (
          <NavDot
            key={i}
            isActive={i === current}
            isLight={isLight}
            name={name}
            onClick={() => { transitioning.current = false; goTo(i); }}
          />
        ))}
      </nav>
    </>
  );
}
