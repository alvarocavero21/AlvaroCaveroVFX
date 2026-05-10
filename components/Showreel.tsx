"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { BGPattern } from "@/components/ui/bg-pattern";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { SplitScramble } from "@/components/ui/split-text";

const SHOWREEL_ID = "quPEH2QJRRI";

export default function Showreel() {
  const { ref, inView } = useInView({ threshold: 0.25, triggerOnce: false });

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
            [00:00:00]
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
