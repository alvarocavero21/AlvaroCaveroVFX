"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef   = useRef<HTMLDivElement>(null);
  const ringRef  = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const mouse    = useRef({ x: -200, y: -200 });
  const ringPos  = useRef({ x: -200, y: -200 });

  useEffect(() => {
    const dot     = dotRef.current;
    const ringEl  = ringRef.current;
    const labelEl = labelRef.current;
    if (!dot || !ringEl || !labelEl) return;

    if (window.matchMedia("(hover: none)").matches) {
      dot.style.display    = "none";
      ringEl.style.display = "none";
      return;
    }

    let expanded = false;

    const toDefault = () => {
      if (!expanded) return;
      expanded = false;
      ringEl.style.width       = "32px";
      ringEl.style.height      = "32px";
      ringEl.style.borderColor = "rgba(200,169,110,0.6)";
      labelEl.style.opacity    = "0";
      dot.style.opacity        = "1";
    };

    const toExpanded = (label: string) => {
      if (expanded && labelEl.textContent === label) return;
      expanded = true;
      ringEl.style.width       = "48px";
      ringEl.style.height      = "48px";
      ringEl.style.borderColor = "rgba(255,255,255,0.9)";
      labelEl.textContent      = label;
      labelEl.style.opacity    = "1";
      dot.style.opacity        = "0";
    };

    const resolveLabel = (x: number, y: number) => {
      const el = document.elementFromPoint(x, y) as HTMLElement | null;
      if (!el) { toDefault(); return; }

      if (el.closest("a"))       { toExpanded("GO");   return; }
      if (el.closest("article")) { toExpanded("PLAY"); return; }

      const btn = el.closest("button");
      if (btn) {
        const txt = (btn.textContent ?? "").toLowerCase();
        toExpanded(txt.includes("watch") ? "PLAY" : "VIEW");
        return;
      }

      toDefault();
    };

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      dot.style.opacity    = "1";
      ringEl.style.opacity = "1";
      resolveLabel(e.clientX, e.clientY);
    };

    const onLeave = () => {
      dot.style.opacity    = "0";
      ringEl.style.opacity = "0";
    };
    const onEnter = () => {
      dot.style.opacity    = "1";
      ringEl.style.opacity = "1";
    };

    const onDown = (e: MouseEvent) => {
      dot.style.transform = "translate(-50%,-50%) scale(2)";
      setTimeout(() => { dot.style.transform = "translate(-50%,-50%) scale(1)"; }, 200);

      const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#c8a96e";
      const ripple = document.createElement("div");
      ripple.style.cssText = [
        "position:fixed",
        `left:${e.clientX}px`,
        `top:${e.clientY}px`,
        "width:0",
        "height:0",
        `border:1px solid ${accent}`,
        "border-radius:50%",
        "transform:translate(-50%,-50%)",
        "pointer-events:none",
        "z-index:99997",
        "animation:cursor-ripple 0.4s ease-out forwards",
      ].join(";");
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 420);
    };

    window.addEventListener("mousemove",    onMove,  { passive: true });
    window.addEventListener("mousedown",    onDown);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    const LERP = 0.12;
    let raf: number;

    const tick = () => {
      ringPos.current.x += (mouse.current.x - ringPos.current.x) * LERP;
      ringPos.current.y += (mouse.current.y - ringPos.current.y) * LERP;

      dot.style.left    = `${mouse.current.x}px`;
      dot.style.top     = `${mouse.current.y}px`;
      ringEl.style.left = `${ringPos.current.x}px`;
      ringEl.style.top  = `${ringPos.current.y}px`;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove",    onMove);
      window.removeEventListener("mousedown",    onDown);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, []);

  return (
    <>
      {/* Inner dot — 1:1 with mouse */}
      <div
        ref={dotRef}
        className="fixed pointer-events-none"
        style={{
          zIndex: 99999,
          width: 4,
          height: 4,
          borderRadius: "50%",
          backgroundColor: "#c8a96e",
          transform: "translate(-50%,-50%)",
          transition: "transform 0.15s cubic-bezier(0.23,1,0.32,1), opacity 0.2s ease",
          left: -200,
          top: -200,
        }}
      />

      {/* Outer ring — lerp follow + context label */}
      <div
        ref={ringRef}
        className="fixed pointer-events-none"
        style={{
          zIndex: 99999,
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "1px solid rgba(200,169,110,0.6)",
          backgroundColor: "transparent",
          transform: "translate(-50%,-50%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "width 0.2s ease, height 0.2s ease, border-color 0.2s ease, opacity 0.2s ease",
          left: -200,
          top: -200,
        }}
      >
        <div
          ref={labelRef}
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 8,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "white",
            opacity: 0,
            transition: "opacity 0.15s ease",
            userSelect: "none",
            lineHeight: 1,
            fontVariationSettings: "'wght' 600",
          }}
        >
          VIEW
        </div>
      </div>
    </>
  );
}
