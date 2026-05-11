"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { BGPattern } from "@/components/ui/bg-pattern";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { SplitScramble } from "@/components/ui/split-text";

const SHOWREEL_ID = "quPEH2QJRRI";
const FPS = 24;

export default function Showreel() {
  const { ref, inView } = useInView({ threshold: 0.25, triggerOnce: false });
  const [timecode, setTimecode] = useState("00:00:00");
  const startRef    = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const overlayRef  = useRef<HTMLDivElement>(null);
  const restoreRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On mousedown: briefly drop pointer-events so the click reaches YouTube,
  // then restore so the overlay can keep capturing wheel events.
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const handleMouseDown = () => {
      overlay.style.pointerEvents = "none";
      if (restoreRef.current) clearTimeout(restoreRef.current);
      restoreRef.current = setTimeout(() => {
        if (overlayRef.current) overlayRef.current.style.pointerEvents = "auto";
      }, 700);
    };
    overlay.addEventListener("mousedown", handleMouseDown);
    return () => {
      overlay.removeEventListener("mousedown", handleMouseDown);
      if (restoreRef.current) clearTimeout(restoreRef.current);
    };
  }, []);

  useEffect(() => {
    if (inView) {
      startRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - (startRef.current ?? Date.now());
        const totalFrames = Math.floor((elapsed / 1000) * FPS);
        const frames  = totalFrames % FPS;
        const totalSecs = Math.floor(elapsed / 1000);
        const secs    = totalSecs % 60;
        const minutes = Math.floor(totalSecs / 60);
        setTimecode(
          `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}:${String(frames).padStart(2, "0")}`
        );
      }, 1000 / 12);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      startRef.current = null;
      setTimecode("00:00:00");
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [inView]);

  return (
    <section
      id="showreel"
      ref={ref}
      className="relative h-screen overflow-hidden flex flex-col pt-20 pb-8"
      style={{ backgroundColor: "var(--bg-primary)", transition: "background-color 0.4s ease" }}
    >
      <BGPattern variant="grid" mask="fade-edges" size={32} fill="rgba(200, 169, 110, 0.15)" />

      {/* Top border line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      {/* Header */}
      <div className="max-w-[1400px] mx-auto w-full px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="flex items-end justify-between mb-3"
        >
          <div>
            <p className="text-[10px] tracking-[0.5em] uppercase text-gold mb-1" style={{ fontFamily: "Inter, sans-serif" }}>
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
            <p className="text-xs text-muted tracking-wider" style={{ fontFamily: "Inter, sans-serif" }}>
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

      {/* Player — fills remaining height */}
      <div className="w-[90%] mx-auto flex-1 min-h-0 flex flex-col">
        <div className="relative flex-1 min-h-0">
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-5 h-5 border-t border-l border-gold/50 z-20 pointer-events-none" />
          <div className="absolute top-0 right-0 w-5 h-5 border-t border-r border-gold/50 z-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-5 h-5 border-b border-l border-gold/50 z-20 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-5 h-5 border-b border-r border-gold/50 z-20 pointer-events-none" />

          <SpotlightCard glowColor="blue" customSize className="w-full h-full">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.15 }}
              className="relative h-full bg-black overflow-hidden"
              style={{ boxShadow: "0 40px 120px rgba(0,0,0,0.8)" }}
            >
              {/* Overlay: captures wheel events (pointer-events:auto) for snap-scroll;
                  drops to none on mousedown for 700ms so YouTube clicks pass through */}
              <div
                ref={overlayRef}
                className="absolute inset-0"
                style={{ zIndex: 10, background: "transparent", pointerEvents: "auto" }}
              />
              <iframe
                src={`https://www.youtube.com/embed/${SHOWREEL_ID}?autoplay=0&controls=1&rel=0&modestbranding=1`}
                title="Showreel"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                style={{ border: "none" }}
              />
            </motion.div>
          </SpotlightCard>
        </div>

        {/* Frame counter */}
        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-[9px] tracking-[0.25em] text-gold/30" style={{ fontFamily: "'Courier New', monospace" }}>
            [{timecode}]
          </span>
          <span className="text-[9px] tracking-[0.25em] text-gold/20" style={{ fontFamily: "'Courier New', monospace" }}>
            24FPS · 4K
          </span>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </section>
  );
}
