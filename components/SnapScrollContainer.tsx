"use client";

import { useCallback, useEffect, useRef, useState, Children } from "react";

const DURATION = 800;
const EASING = "cubic-bezier(0.76, 0, 0.24, 1)";

export default function SnapScrollContainer({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState(0);
  const transitioning = useRef(false);
  const currentRef = useRef(0);
  const touchStartY = useRef(0);
  const sections = Children.toArray(children);
  const total = sections.length;

  const goTo = useCallback((next: number) => {
    if (next < 0 || next >= total) return;
    if (next === currentRef.current) return;
    transitioning.current = true;
    currentRef.current = next;
    setCurrent(next);
    setTimeout(() => { transitioning.current = false; }, DURATION + 100);
  }, [total]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      // Allow scrolling inside elements that have scrollable overflow
      const target = e.target as HTMLElement;
      let el: HTMLElement | null = target;
      while (el && el !== document.body) {
        const style = window.getComputedStyle(el);
        const canScroll = (style.overflowY === "auto" || style.overflowY === "scroll") && el.scrollHeight > el.clientHeight;
        if (canScroll) {
          const atTop = el.scrollTop <= 0;
          const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
          if (e.deltaY < 0 && !atTop) return;
          if (e.deltaY > 0 && !atBottom) return;
        }
        el = el.parentElement;
      }

      e.preventDefault();
      if (transitioning.current) return;
      if (e.deltaY > 0) goTo(currentRef.current + 1);
      else goTo(currentRef.current - 1);
    };

    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown"].includes(e.key)) { e.preventDefault(); goTo(currentRef.current + 1); }
      if (["ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); goTo(currentRef.current - 1); }
    };

    const onTouchStart = (e: TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
    const onTouchEnd = (e: TouchEvent) => {
      if (transitioning.current) return;
      const d = touchStartY.current - e.changedTouches[0].clientY;
      if (d > 50) goTo(currentRef.current + 1);
      else if (d < -50) goTo(currentRef.current - 1);
    };

    const onGoto = (e: Event) => {
      transitioning.current = false;
      goTo((e as CustomEvent<number>).detail);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("snap-goto", onGoto);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("snap-goto", onGoto);
    };
  }, [goTo]);

  return (
    <>
      {/* Section stack — fixed, full-viewport */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden" }}>
        {sections.map((section, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: i + 1,
              transform: i > current
                ? "translateY(100%) scale(1.02)"
                : "translateY(0) scale(1)",
              transition: `transform ${DURATION}ms ${EASING}`,
              willChange: "transform",
            }}
          >
            {section}
          </div>
        ))}
      </div>

      {/* Dot navigation — fixed right side */}
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
          alignItems: "center",
          gap: 14,
        }}
      >
        {sections.map((_, i) => (
          <button
            key={i}
            onClick={() => { transitioning.current = false; goTo(i); }}
            aria-label={`Go to section ${i + 1}`}
            style={{
              width: i === current ? 10 : 6,
              height: i === current ? 10 : 6,
              borderRadius: "50%",
              background: i === current ? "#c8a96e" : "rgba(255,255,255,0.28)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              outline: "none",
              transition: "all 0.35s ease",
              boxShadow: i === current ? "0 0 10px rgba(200,169,110,0.5)" : "none",
            }}
          />
        ))}
      </nav>
    </>
  );
}
