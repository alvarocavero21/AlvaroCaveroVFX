"use client";

import { useCallback, useEffect, useRef, useState, Children } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const DURATION = 800;
const EASING   = "cubic-bezier(0.76, 0, 0.24, 1)";
// Wheel events closer together than this belong to the same gesture (incl. macOS/Safari trackpad momentum)
const WHEEL_GESTURE_GAP = 200;

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
  const unlockTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const windowRef     = useRef<HTMLDivElement>(null);

  const goTo = useCallback((next: number) => {
    if (next < 0 || next >= TOTAL) return;
    if (next === currentRef.current) return;
    transitioning.current = true;
    currentRef.current    = next;
    setCurrent(next);
    window.dispatchEvent(new CustomEvent("snap-section", { detail: next }));
    // A nav click mid-transition starts a new one: drop the previous unlock so it can't end this one early
    if (unlockTimer.current) clearTimeout(unlockTimer.current);
    unlockTimer.current = setTimeout(() => { transitioning.current = false; }, DURATION + 100);
  }, []);

  useEffect(() => () => { if (unlockTimer.current) clearTimeout(unlockTimer.current); }, []);

  // Prevent browser scroll-restoration from showing a section other than Hero on reload
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let lastWheelAt     = 0;
    let wheelGestureUsed = false;

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
      // Trackpad momentum keeps firing wheel events for 1–2s, longer than the transition lock,
      // which made one swipe skip two sections. Only one snap per continuous wheel gesture.
      const now = performance.now();
      if (now - lastWheelAt > WHEEL_GESTURE_GAP) wheelGestureUsed = false;
      lastWheelAt = now;
      if (transitioning.current || wheelGestureUsed) return;
      wheelGestureUsed = true;
      if (e.deltaY > 0) goTo(currentRef.current + 1);
      else              goTo(currentRef.current - 1);
    };

    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown"].includes(e.key)) { e.preventDefault(); goTo(currentRef.current + 1); }
      if (["ArrowUp",   "PageUp"  ].includes(e.key)) { e.preventDefault(); goTo(currentRef.current - 1); }
    };

    // Touch: same idea as wheel — if the swipe started inside a scrollable element
    // (e.g. Projects card list) that wasn't at its edge, let it scroll instead of snapping
    let touchScrollEl: HTMLElement | null = null;
    let touchStartScroll = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchScrollEl = null;
      let el = e.target as HTMLElement | null;
      while (el && el !== document.body) {
        const s = window.getComputedStyle(el);
        if ((s.overflowY === "auto" || s.overflowY === "scroll") && el.scrollHeight > el.clientHeight) {
          touchScrollEl = el;
          touchStartScroll = el.scrollTop;
          break;
        }
        el = el.parentElement;
      }
    };
    const onTouchEnd   = (e: TouchEvent) => {
      const scrollEl = touchScrollEl;
      touchScrollEl = null;
      if (transitioning.current) return;
      const d = touchStartY.current - e.changedTouches[0].clientY;
      if (scrollEl) {
        const atTop    = touchStartScroll <= 0;
        const atBottom = touchStartScroll + scrollEl.clientHeight >= scrollEl.scrollHeight - 2;
        if (d >  50 && !atBottom) return;
        if (d < -50 && !atTop)    return;
      }
      if      (d >  50) goTo(currentRef.current + 1);
      else if (d < -50) goTo(currentRef.current - 1);
    };

    // iOS fires touchcancel instead of touchend when the system takes the gesture over
    const onTouchCancel = () => { touchScrollEl = null; };

    // Panels sit inside an overflow:hidden window. Focusing an element in an off-screen panel
    // (Tab key, screen readers) makes the browser scroll that window, which shifts every panel
    // out of alignment with the translateY strip. Undo that scroll and snap to the focused panel.
    const win = windowRef.current;
    const onWindowScroll = () => { if (win && win.scrollTop !== 0) win.scrollTop = 0; };
    const onFocusIn = (e: FocusEvent) => {
      const strip = win?.firstElementChild;
      if (!strip) return;
      const idx = Array.from(strip.children).findIndex((panel) => panel.contains(e.target as Node));
      if (idx >= 0 && idx < TOTAL && idx !== currentRef.current) {
        transitioning.current = false;
        goTo(idx);
      }
    };

    const onGoto = (e: Event) => {
      transitioning.current = false;
      goTo((e as CustomEvent<number>).detail);
    };

    window.addEventListener("wheel",      onWheel,      { passive: false });
    window.addEventListener("keydown",    onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend",   onTouchEnd,   { passive: true });
    window.addEventListener("touchcancel", onTouchCancel, { passive: true });
    window.addEventListener("snap-goto",  onGoto);
    win?.addEventListener("scroll",  onWindowScroll, { passive: true });
    win?.addEventListener("focusin", onFocusIn);

    return () => {
      window.removeEventListener("wheel",      onWheel);
      window.removeEventListener("keydown",    onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend",   onTouchEnd);
      window.removeEventListener("touchcancel", onTouchCancel);
      window.removeEventListener("snap-goto",  onGoto);
      win?.removeEventListener("scroll",  onWindowScroll);
      win?.removeEventListener("focusin", onFocusIn);
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
      <div ref={windowRef} style={{ position: "fixed", inset: 0, overflow: "hidden" }}>
        <div
          style={{
            width: "100%",
            // --snap-h = 100dvh where supported (see globals.css) so panels match the visible viewport on mobile
            transform: `translateY(calc(var(--snap-h) * -${current}))`,
            transition: `transform ${DURATION}ms ${EASING}`,
            willChange: "transform",
          }}
        >
          {panels.map((panel, i) => (
            <div
              key={i}
              style={{ width: "100%", height: "var(--snap-h)", overflow: "hidden", position: "relative" }}
            >
              {panel}
            </div>
          ))}

          {/* Padding slots if somehow fewer than TOTAL children are passed */}
          {Array.from({ length: Math.max(0, TOTAL - panels.length) }).map((_, i) => (
            <div key={`pad-${i}`} style={{ width: "100%", height: "var(--snap-h)" }} />
          ))}
        </div>
      </div>

      {/* Editorial section counter — bottom-left */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          bottom: 32,
          left: 32,
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 2,
          pointerEvents: "none",
          userSelect: "none",
          fontFamily: "'Courier New', monospace",
        }}
      >
        <span
          style={{
            fontSize: 11,
            letterSpacing: "0.22em",
            color: isLight ? "rgba(26,26,26,0.45)" : "rgba(200,169,110,0.65)",
            lineHeight: 1,
            transition: "color 0.4s ease",
          }}
        >
          {String(current + 1).padStart(2, "0")}
        </span>
        <div style={{ width: 18, height: 1, background: isLight ? "rgba(26,26,26,0.15)" : "rgba(200,169,110,0.25)", transition: "background 0.4s ease" }} />
        <span
          style={{
            fontSize: 9,
            letterSpacing: "0.18em",
            color: isLight ? "rgba(26,26,26,0.20)" : "rgba(200,169,110,0.30)",
            lineHeight: 1,
            transition: "color 0.4s ease",
          }}
        >
          {String(TOTAL).padStart(2, "0")}
        </span>
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
