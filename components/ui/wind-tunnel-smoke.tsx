"use client";

import { useEffect, useRef } from "react";

// Multi-octave turbulence field — cheap approximation of Perlin noise
function noiseXY(x: number, y: number, t: number): { nx: number; ny: number } {
  const nx =
    Math.sin(x * 0.011 + t * 0.70) * Math.cos(y * 0.016 + t * 0.40) * 0.50 +
    Math.sin(x * 0.024 - t * 0.50 + y * 0.013) * 0.30 +
    Math.sin(x * 0.048 + t * 0.20 + y * 0.031) * 0.20;
  const ny =
    Math.cos(x * 0.014 + t * 0.60) * Math.sin(y * 0.019 - t * 0.35) * 0.50 +
    Math.cos(x * 0.027 + t * 0.45 - y * 0.011) * 0.30 +
    Math.cos(x * 0.051 - t * 0.18 + y * 0.029) * 0.20;
  return { nx, ny };
}

interface Particle {
  active: boolean;
  x: number; y: number;
  vx: number; vy: number;
  radius: number;
  maxOpacity: number;
  age: number;
  maxAge: number;
  cr: number; cg: number; cb: number;
}

function makePool(n: number): Particle[] {
  return Array.from({ length: n }, () => ({
    active: false,
    x: 0, y: 0, vx: 0, vy: 0,
    radius: 0, maxOpacity: 0,
    age: 0, maxAge: 0,
    cr: 175, cg: 170, cb: 160,
  }));
}

function spawnParticle(
  pool: Particle[],
  spawnCenterY: number,
  spawnSpread: number,
): void {
  for (let i = 0; i < pool.length; i++) {
    const p = pool[i];
    if (p.active) continue;

    p.active = true;
    p.x = -Math.random() * 30;
    p.y = spawnCenterY + (Math.random() - 0.5) * spawnSpread;
    p.vx = 2.5 + Math.random() * 1.5;       // 2.5 – 4.0 rightward
    p.vy = (Math.random() - 0.5) * 0.6;      // −0.3 – 0.3
    p.radius = 15 + Math.random() * 20;       // 15 – 35 px
    p.maxOpacity = 0.10 + Math.random() * 0.16;
    p.age = 0;
    p.maxAge = 120 + Math.floor(Math.random() * 60); // 120–180 frames

    // Slight warm/cool colour variation
    if (Math.random() < 0.5) { p.cr = 180; p.cg = 170; p.cb = 155; } // warm
    else                      { p.cr = 165; p.cg = 168; p.cb = 172; } // cool
    return;
  }
}

export default function WindTunnelSmoke() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const MAX_P     = isMobile ? 100 : 200;
    const SPAWN_RATE = isMobile ? 0.8 : 1.6; // particles per frame

    const pool = makePool(MAX_P);

    // Mutable flags — read inside the RAF tick without closure issues
    let isLight  = false;
    let isHero   = true;  // assume hero is active on mount
    let spawning = false;
    let spawnAccum = 0;

    const setVisibility = () => {
      isLight  = document.documentElement.classList.contains("light");
      spawning = isLight && isHero;
      canvas.style.opacity = spawning ? "1" : "0";
    };

    // Observe html.light class changes
    const mutObs = new MutationObserver(setVisibility);
    mutObs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Snap-scroll section events
    const onSection = (e: Event) => {
      isHero = (e as CustomEvent<number>).detail === 0;
      setVisibility();
    };
    window.addEventListener("snap-section", onSection);

    setVisibility(); // initial evaluation

    // Canvas sizing
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let frame = 0;
    let raf: number;

    const tick = () => {
      frame++;
      raf = requestAnimationFrame(tick);

      // Locate the ALVARO title every frame — handles font load + resize
      const titleEl = document.getElementById("alvaro-title");
      const titleRect = titleEl ? titleEl.getBoundingClientRect() : null;

      const spawnCenterY = titleRect
        ? titleRect.top + titleRect.height * 0.5
        : canvas.height * 0.42;
      const spawnSpread  = titleRect ? titleRect.height * 3.0 : 320;

      // Spawn new particles only when active
      if (spawning) {
        spawnAccum += SPAWN_RATE;
        while (spawnAccum >= 1) {
          spawnParticle(pool, spawnCenterY, spawnSpread);
          spawnAccum -= 1;
        }
      }

      // Skip heavy render when invisible or tab is hidden
      if (!isLight || document.hidden) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = frame * 0.016; // approx elapsed seconds

      for (let i = 0; i < pool.length; i++) {
        const p = pool[i];
        if (!p.active) continue;

        p.age++;

        if (p.x > canvas.width + p.radius || p.age >= p.maxAge) {
          p.active = false;
          continue;
        }

        // ── Turbulence ──────────────────────────────────────────────────────
        const { nx, ny } = noiseXY(p.x, p.y, t);
        p.vx += nx * 0.045;
        p.vy += ny * 0.045;

        // ── Letter collision + wake ─────────────────────────────────────────
        if (titleRect) {
          const PAD     = 38;
          const midY    = titleRect.top + titleRect.height * 0.5;

          const inApproach =
            p.x > titleRect.left   - PAD &&
            p.x < titleRect.right  + PAD &&
            p.y > titleRect.top    - PAD * 0.6 &&
            p.y < titleRect.bottom + PAD * 0.6;

          if (inApproach) {
            const inBox =
              p.x > titleRect.left &&
              p.x < titleRect.right &&
              p.y > titleRect.top &&
              p.y < titleRect.bottom;

            if (inBox) {
              // Hard ejection — push to nearest vertical edge
              const dTop = p.y - titleRect.top;
              const dBot = titleRect.bottom - p.y;
              if (dTop <= dBot) {
                p.y  = titleRect.top - 2;
                p.vy = -(Math.abs(p.vy) + 0.6);
              } else {
                p.y  = titleRect.bottom + 2;
                p.vy =  Math.abs(p.vy) + 0.6;
              }
            } else {
              // Smooth deflection approaching the letters
              const deflect = 0.075;
              if (p.y < midY) p.vy -= deflect; // steer up
              else             p.vy += deflect; // steer down

              // Bernoulli speed-up alongside letter edges
              if (p.x > titleRect.left - 25 && p.x < titleRect.right + 25) {
                p.vx *= 1.006;
              }
            }
          }

          // Wake zone — chaotic turbulence in the aerodynamic shadow
          const WAKE_LEN = 300;
          const inWake =
            p.x > titleRect.right &&
            p.x < titleRect.right + WAKE_LEN &&
            p.y > titleRect.top   - 55 &&
            p.y < titleRect.bottom + 55;

          if (inWake) {
            const decay = 1 - (p.x - titleRect.right) / WAKE_LEN;
            p.vx += (Math.random() - 0.5) * 0.18 * decay;
            p.vy += (Math.random() - 0.5) * 0.50 * decay;
          }
        }

        // ── Damping + clamp ─────────────────────────────────────────────────
        p.vy *= 0.984;
        p.vx  = Math.max(0.2, Math.min(p.vx, 10));
        p.vy  = Math.max(-4,  Math.min(p.vy,  4));

        p.x += p.vx;
        p.y += p.vy;

        // ── Opacity envelope: fade-in 0–20 %, hold, fade-out 70–100 % ──────
        const ratio = p.age / p.maxAge;
        let alpha: number;
        if      (ratio < 0.20) alpha = (ratio / 0.20) * p.maxOpacity;
        else if (ratio > 0.70) alpha = ((1 - ratio) / 0.30) * p.maxOpacity;
        else                   alpha = p.maxOpacity;

        if (alpha < 0.004) continue;

        // ── Radial gradient — soft volumetric puff ──────────────────────────
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        grd.addColorStop(0,    `rgba(${p.cr},${p.cg},${p.cb},${alpha})`);
        grd.addColorStop(0.45, `rgba(${p.cr},${p.cg},${p.cb},${alpha * 0.55})`);
        grd.addColorStop(1,    `rgba(${p.cr},${p.cg},${p.cb},0)`);

        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("snap-section", onSection);
      mutObs.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 5,
        pointerEvents: "none",
        display: "block",
        opacity: 0,
        transition: "opacity 0.8s ease",
        // CSS-level blur — GPU-accelerated, softens particle edges
        filter: "blur(6px)",
      }}
    />
  );
}
