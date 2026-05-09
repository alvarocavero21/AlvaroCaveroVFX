"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { BGPattern } from "@/components/ui/bg-pattern";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { SplitScramble } from "@/components/ui/split-text";

function ShowreelPlaceholder() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    type Dot = { x: number; y: number; vx: number; vy: number; r: number; a: number };
    const dots: Dot[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      a: Math.random() * 0.4 + 0.1,
    }));

    // Pause when tab is hidden or section is not active
    let paused = false;
    let isShowreelSection = false;

    const updatePause = () => { paused = document.hidden || !isShowreelSection; };
    const onVisibility = () => updatePause();
    document.addEventListener("visibilitychange", onVisibility);

    const onSection = (e: Event) => {
      isShowreelSection = (e as CustomEvent<number>).detail === 1;
      updatePause();
    };
    window.addEventListener("snap-section", onSection);

    let raf: number;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (paused) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0) d.x = canvas.width;
        if (d.x > canvas.width) d.x = 0;
        if (d.y < 0) d.y = canvas.height;
        if (d.y > canvas.height) d.y = 0;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,169,110,${d.a})`;
        ctx.fill();
      }
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("snap-section", onSection);
    };
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(200,169,110,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(200,169,110,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Rotating dashed border */}
      <div
        className="absolute pointer-events-none"
        style={{ inset: 16, animation: "border-spin 18s linear infinite" }}
      >
        <div style={{ width: "100%", height: "100%", border: "1px dashed rgba(200,169,110,0.18)" }} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4">
        <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3rem,8vw,7rem)", color: "#c8a96e", letterSpacing: "0.15em", lineHeight: 1 }}>
          SHOWREEL
        </p>
        <p
          style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(10px,1.2vw,14px)", color: "var(--text-muted)", letterSpacing: "0.5em", textTransform: "uppercase", animation: "cs-pulse 2.4s ease-in-out infinite" }}
        >
          Coming Soon
        </p>
        <motion.div
          animate={{ scaleX: [0.3, 1, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="h-px bg-gold/50 origin-center"
          style={{ width: 120 }}
        />
      </div>
    </div>
  );
}

export default function Showreel() {
  const { ref, inView } = useInView({ threshold: 0.25, triggerOnce: false });

  return (
    <section id="showreel" ref={ref} className="relative h-screen overflow-hidden flex flex-col pt-20 pb-8" style={{ backgroundColor: "var(--bg-primary)", transition: "background-color 0.4s ease" }}>
      <BGPattern
        variant="grid"
        mask="fade-edges"
        size={32}
        fill="rgba(200, 169, 110, 0.15)"
      />

      {/* Top border line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      {/* Header — constrained to readable width */}
      <div className="max-w-[1400px] mx-auto w-full px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="flex items-end justify-between mb-3"
        >
          <div>
            <p
              className="text-[10px] tracking-[0.5em] uppercase text-gold mb-1"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Demo Reel
            </p>
            <h2
              className="text-[clamp(2rem,4.5vw,4rem)] leading-none text-white tracking-wide"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              <SplitScramble text="· SHOWREEL ·" stagger={0.05} />
            </h2>
          </div>
          <div className="hidden md:block text-right">
            <p
              className="text-xs text-muted tracking-wider"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Houdini · Karma XPU · Nuke
            </p>
          </div>
        </motion.div>

        {/* Gold accent line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="origin-left h-px bg-gold/40 mb-4"
        />
      </div>

      {/* Player — fills remaining height so the title above is never squeezed off-screen */}
      <div className="w-[90%] mx-auto flex-1 min-h-0 flex flex-col">
        {/* Corner bracket wrapper */}
        <div className="relative flex-1 min-h-0">
          {/* TL bracket */}
          <div className="absolute top-0 left-0 w-5 h-5 border-t border-l border-gold/50 z-20 pointer-events-none" />
          {/* TR bracket */}
          <div className="absolute top-0 right-0 w-5 h-5 border-t border-r border-gold/50 z-20 pointer-events-none" />
          {/* BL bracket */}
          <div className="absolute bottom-0 left-0 w-5 h-5 border-b border-l border-gold/50 z-20 pointer-events-none" />
          {/* BR bracket */}
          <div className="absolute bottom-0 right-0 w-5 h-5 border-b border-r border-gold/50 z-20 pointer-events-none" />

          <SpotlightCard glowColor="blue" customSize className="w-full h-full">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.15 }}
              className="relative h-full bg-black overflow-hidden"
              style={{ boxShadow: "0 40px 120px rgba(0,0,0,0.8)" }}
            >
              <ShowreelPlaceholder />
            </motion.div>
          </SpotlightCard>
        </div>

        {/* Frame counter */}
        <div className="flex items-center justify-between mt-2 px-1">
          <span
            className="text-[9px] tracking-[0.25em] text-gold/30"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            [00:00:00]
          </span>
          <span
            className="text-[9px] tracking-[0.25em] text-gold/20"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            24FPS · 4K
          </span>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </section>
  );
}
