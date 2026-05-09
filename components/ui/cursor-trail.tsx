"use client";

import { useEffect, useRef } from "react";

const MAX_PARTICLES     = 40;
const MAX_PARTICLES_LOW = 20;

function getTrailColor(): string {
  if (typeof document === "undefined") return "#c8a96e";
  return getComputedStyle(document.documentElement)
    .getPropertyValue("--accent")
    .trim() || "#c8a96e";
}

interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  decay: number;
}

function makePool(n: number): Particle[] {
  return Array.from({ length: n }, () => ({
    active: false,
    x: 0, y: 0,
    vx: 0, vy: 0,
    size: 0,
    opacity: 0,
    life: 0,
    decay: 0,
  }));
}

function spawn(pool: Particle[], x: number, y: number) {
  for (let i = 0; i < pool.length; i++) {
    const p = pool[i];
    if (p.active) continue;
    const lifetimeMs = 600 + Math.random() * 400;
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.3 + Math.random() * 0.8;
    p.active  = true;
    p.x       = x;
    p.y       = y;
    p.vx      = Math.cos(angle) * speed;
    p.vy      = Math.sin(angle) * speed;
    p.size    = 2 + Math.random() * 3;
    p.opacity = 0.4 + Math.random() * 0.6;
    p.life    = 1;
    p.decay   = 1 / lifetimeMs;
    return;
  }
}

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const isLow  = typeof navigator !== "undefined" && navigator.hardwareConcurrency < 4;
    const maxP   = isLow ? MAX_PARTICLES_LOW : MAX_PARTICLES;
    const perEvt = isLow ? 1 : 2;

    const pool = makePool(maxP);

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const onMove = (e: MouseEvent) => {
      if (document.hidden) return;
      const count = perEvt + (Math.random() < 0.4 ? 1 : 0);
      for (let i = 0; i < count; i++) spawn(pool, e.clientX, e.clientY);
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    let last = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const dt = Math.min(now - last, 50);
      last = now;

      // Pause entire loop when tab is hidden
      if (document.hidden) {
        raf = requestAnimationFrame(tick);
        return;
      }

      let anyActive = false;
      for (let i = 0; i < pool.length; i++) {
        if (pool[i].active) { anyActive = true; break; }
      }

      if (!anyActive) {
        raf = requestAnimationFrame(tick);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const color = getTrailColor();
      ctx.shadowBlur  = 6;
      ctx.shadowColor = color;
      ctx.fillStyle   = color;

      for (let i = 0; i < pool.length; i++) {
        const p = pool[i];
        if (!p.active) continue;

        p.life -= p.decay * dt;
        if (p.life <= 0) { p.active = false; continue; }

        p.x  += p.vx;
        p.y  += p.vy;
        p.vx *= 0.97;
        p.vy *= 0.97;

        const alpha = p.opacity * p.life;
        const r     = Math.max(p.size * p.life, 0.1);

        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    />
  );
}
