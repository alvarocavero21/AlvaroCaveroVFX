"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const onMove = (e: MouseEvent) => {
      dot.style.left  = `${e.clientX}px`;
      dot.style.top   = `${e.clientY}px`;
      ring.style.left = `${e.clientX}px`;
      ring.style.top  = `${e.clientY}px`;
    };

    const onEnter = () => {
      dot.style.transform = "translate(-50%, -50%) scale(0)";
      ring.style.width    = "48px";
      ring.style.height   = "48px";
    };
    const onLeave = () => {
      dot.style.transform = "translate(-50%, -50%) scale(1)";
      ring.style.width    = "32px";
      ring.style.height   = "32px";
    };

    window.addEventListener("mousemove", onMove);
    const els = document.querySelectorAll<Element>("a, button, [data-cursor]");
    els.forEach(el => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    return () => {
      window.removeEventListener("mousemove", onMove);
      els.forEach(el => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="fixed pointer-events-none z-[9999] mix-blend-difference"
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "#c8a96e",
          transform: "translate(-50%, -50%) scale(1)",
          transition: "transform 0.15s ease",
          left: -100,
          top: -100,
        }}
      />
      <div
        ref={ringRef}
        className="fixed pointer-events-none z-[9999]"
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "1px solid rgba(200,169,110,0.5)",
          transform: "translate(-50%, -50%)",
          transition: "width 0.25s ease, height 0.25s ease",
          left: -100,
          top: -100,
        }}
      />
    </>
  );
}
