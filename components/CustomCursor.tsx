"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mouse   = useRef({ x: -200, y: -200 });
  const ring    = useRef({ x: -200, y: -200 });

  useEffect(() => {
    const dot   = dotRef.current;
    const ringEl = ringRef.current;
    if (!dot || !ringEl) return;

    // Hide on touch-only devices
    if (window.matchMedia("(hover: none)").matches) {
      dot.style.display = "none";
      ringEl.style.display = "none";
      return;
    }

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    type State = "default" | "link" | "button";
    const apply = (s: State) => {
      const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent-rgb").trim() || "200,169,110";
      if (s === "link") {
        dot.style.opacity = "0";
        ringEl.style.width  = "52px";
        ringEl.style.height = "52px";
        ringEl.style.borderColor = `rgba(${accent},0.9)`;
        ringEl.style.backgroundColor = `rgba(${accent},0.06)`;
      } else if (s === "button") {
        dot.style.opacity = "1";
        dot.style.width  = "4px";
        dot.style.height = "4px";
        ringEl.style.width  = "22px";
        ringEl.style.height = "22px";
        ringEl.style.borderColor = `rgba(${accent},0.7)`;
        ringEl.style.backgroundColor = "transparent";
      } else {
        dot.style.opacity = "1";
        dot.style.width  = "8px";
        dot.style.height = "8px";
        ringEl.style.width  = "34px";
        ringEl.style.height = "34px";
        ringEl.style.borderColor = `rgba(${accent},0.45)`;
        ringEl.style.backgroundColor = "transparent";
      }
    };

    const onDown = () => {
      dot.style.transform = "translate(-50%,-50%) scale(1.6)";
      ringEl.style.transform = "translate(-50%,-50%) scale(0.82)";
    };
    const onUp = () => {
      dot.style.transform = "translate(-50%,-50%) scale(1)";
      ringEl.style.transform = "translate(-50%,-50%) scale(1)";
    };

    const wire = () => {
      document.querySelectorAll<HTMLElement>("a").forEach(el => {
        el.addEventListener("mouseenter", () => apply("link"));
        el.addEventListener("mouseleave", () => apply("default"));
      });
      document.querySelectorAll<HTMLElement>("button").forEach(el => {
        el.addEventListener("mouseenter", () => apply("button"));
        el.addEventListener("mouseleave", () => apply("default"));
        el.addEventListener("mousedown",  onDown);
        el.addEventListener("mouseup",    onUp);
      });
    };
    wire();

    window.addEventListener("mousemove", onMove);

    // Pick up dynamically added elements
    const mo = new MutationObserver(wire);
    mo.observe(document.body, { childList: true, subtree: true });

    // RAF lerp loop — ring follows with lag, dot is instant
    const LERP = 0.11;
    let raf: number;
    const tick = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * LERP;
      ring.current.y += (mouse.current.y - ring.current.y) * LERP;
      dot.style.left   = `${mouse.current.x}px`;
      dot.style.top    = `${mouse.current.y}px`;
      ringEl.style.left = `${ring.current.x}px`;
      ringEl.style.top  = `${ring.current.y}px`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      mo.disconnect();
    };
  }, []);

  return (
    <>
      {/* Inner dot — perfectly 1:1, no CSS position transition */}
      <div
        ref={dotRef}
        className="fixed pointer-events-none"
        style={{
          zIndex: 99999,
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "var(--accent)",
          transform: "translate(-50%,-50%)",
          transition: "width 0.2s ease, height 0.2s ease, opacity 0.2s ease, transform 0.18s cubic-bezier(0.23,1,0.32,1)",
          left: -200,
          top: -200,
        }}
      />
      {/* Outer ring — follows with lerp delay */}
      <div
        ref={ringRef}
        className="fixed pointer-events-none"
        style={{
          zIndex: 99999,
          width: 34,
          height: 34,
          borderRadius: "50%",
          border: "1px solid var(--border-gold-faint)",
          transform: "translate(-50%,-50%)",
          transition: [
            "width 0.35s cubic-bezier(0.23,1,0.32,1)",
            "height 0.35s cubic-bezier(0.23,1,0.32,1)",
            "border-color 0.3s ease",
            "background-color 0.3s ease",
            "transform 0.25s cubic-bezier(0.23,1,0.32,1)",
          ].join(", "),
          left: -200,
          top: -200,
        }}
      />
    </>
  );
}
