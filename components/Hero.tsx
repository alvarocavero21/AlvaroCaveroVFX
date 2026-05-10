"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import MagneticWrapper from "./MagneticWrapper";
import { SplitText } from "@/components/ui/split-text";
import { useActiveSection } from "@/components/ui/variable-text";
import { useTheme } from "@/contexts/ThemeContext";

const FloatingPaths = dynamic<{ position: number }>(
  () => import("@/components/ui/background-paths").then((m) => ({ default: m.FloatingPaths })),
  { ssr: false }
);

// ── Inline SVG icons ──────────────────────────────────────────────────────────

const IconHoudini = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" className="w-full h-full">
    <circle cx="32" cy="9"  r="6.5" strokeWidth="1.8"/>
    <circle cx="9"  cy="51" r="6.5" strokeWidth="1.8"/>
    <circle cx="55" cy="51" r="6.5" strokeWidth="1.8"/>
    <circle cx="32" cy="9"  r="2.5" fill="currentColor" stroke="none"/>
    <circle cx="9"  cy="51" r="2.5" fill="currentColor" stroke="none"/>
    <circle cx="55" cy="51" r="2.5" fill="currentColor" stroke="none"/>
    <line x1="32" y1="15.5" x2="14"  y2="44.5" strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="32" y1="15.5" x2="50"  y2="44.5" strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="15.5" y1="51" x2="48.5" y2="51"  strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const IconMaya = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" className="w-full h-full">
    <path d="M7 56 L7 12 L32 42 L57 12 L57 56" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="7" y1="56" x2="57" y2="56" strokeWidth="1.2" opacity="0.35"/>
  </svg>
);

const IconNuke = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" className="w-full h-full">
    <circle cx="32" cy="32" r="27" strokeWidth="1" opacity="0.25"/>
    <ellipse cx="32" cy="32" rx="27" ry="10.5" strokeWidth="1.4" transform="rotate(-38 32 32)"/>
    <ellipse cx="32" cy="32" rx="27" ry="10.5" strokeWidth="1.4" transform="rotate(38 32 32)"/>
    <circle cx="32" cy="32" r="5" fill="currentColor" stroke="none"/>
    <path d="M20 16 L20 48 L44 16 L44 48" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconUnreal = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" className="w-full h-full">
    <path d="M14 9 L14 40 C14 55 50 55 50 40 L50 9" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="7"  y1="9" x2="21" y2="9" strokeWidth="5.5" strokeLinecap="round"/>
    <line x1="43" y1="9" x2="57" y2="9" strokeWidth="5.5" strokeLinecap="round"/>
  </svg>
);

const IconComfy = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" className="w-full h-full">
    <rect x="2"  y="19" width="16" height="11" rx="2.5" strokeWidth="1.5"/>
    <rect x="2"  y="35" width="16" height="11" rx="2.5" strokeWidth="1.5"/>
    <rect x="24" y="7"  width="16" height="11" rx="2.5" strokeWidth="1.5" fill="currentColor" fillOpacity="0.12"/>
    <rect x="24" y="26" width="16" height="11" rx="2.5" strokeWidth="1.5" fill="currentColor" fillOpacity="0.12"/>
    <rect x="24" y="45" width="16" height="11" rx="2.5" strokeWidth="1.5" fill="currentColor" fillOpacity="0.12"/>
    <rect x="46" y="19" width="16" height="11" rx="2.5" strokeWidth="1.5"/>
    <rect x="46" y="35" width="16" height="11" rx="2.5" strokeWidth="1.5"/>
    <line x1="18" y1="25" x2="24" y2="12" strokeWidth="1.1" strokeLinecap="round"/>
    <line x1="18" y1="25" x2="24" y2="31" strokeWidth="1.1" strokeLinecap="round"/>
    <line x1="18" y1="41" x2="24" y2="31" strokeWidth="1.1" strokeLinecap="round"/>
    <line x1="18" y1="41" x2="24" y2="50" strokeWidth="1.1" strokeLinecap="round"/>
    <line x1="40" y1="12" x2="46" y2="25" strokeWidth="1.1" strokeLinecap="round"/>
    <line x1="40" y1="31" x2="46" y2="25" strokeWidth="1.1" strokeLinecap="round"/>
    <line x1="40" y1="31" x2="46" y2="41" strokeWidth="1.1" strokeLinecap="round"/>
    <line x1="40" y1="50" x2="46" y2="41" strokeWidth="1.1" strokeLinecap="round"/>
  </svg>
);

type HeroSW = { name: string; logoSrc?: string; icon: React.ReactNode };

const HERO_SOFTWARE: HeroSW[] = [
  { name: "Houdini",       logoSrc: "/logos/houdini.svg", icon: <IconHoudini /> },
  { name: "Maya",          logoSrc: "/logos/maya.svg",    icon: <IconMaya /> },
  { name: "Unreal Engine", logoSrc: "/logos/unreal.png",  icon: <IconUnreal /> },
  { name: "ComfyUI",       logoSrc: "/logos/comfyui.png", icon: <IconComfy /> },
];

function HeroLogo({ sw, isLight }: { sw: HeroSW; isLight: boolean }) {
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const rotateY = ((e.clientX - (rect.left + rect.width / 2)) / rect.width) * 30;
    const rotateX = -((e.clientY - (rect.top + rect.height / 2)) / rect.height) * 30;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => setHovered(true);

  const handleMouseLeave = () => {
    setHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const transform = hovered
    ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(20px) scale(1.05)`
    : "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)";

  const transition = hovered
    ? "transform 0.1s ease, box-shadow 0.1s ease"
    : "transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s cubic-bezier(0.23, 1, 0.32, 1)";

  // Converts any logo to gold on dark bg, dark on light bg
  const darkFilter = hovered
    ? "brightness(0) invert(1) sepia(1) saturate(1.5) hue-rotate(5deg)"
    : "brightness(0) invert(1) sepia(1) saturate(1.5) hue-rotate(5deg) opacity(0.65)";
  const lightFilter = hovered
    ? "brightness(0) opacity(0.65)"
    : "brightness(0) opacity(0.35)";

  return (
    <div
      ref={cardRef}
      className="flex flex-col items-center gap-2.5 p-3 rounded-sm cursor-default"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition,
        transformStyle: "preserve-3d",
        willChange: hovered ? "transform" : "auto",
        boxShadow: hovered ? "0 20px 40px rgba(200,169,110,0.4)" : "0 0 0 rgba(0,0,0,0)",
      }}
    >
      <div style={{ width: 70, height: 70 }}>
        {sw.logoSrc ? (
          <img
            src={sw.logoSrc}
            alt={sw.name}
            width={70}
            height={70}
            className="w-full h-full object-contain"
            style={{
              filter: isLight ? lightFilter : darkFilter,
              transition: hovered ? "filter 0.1s ease" : "filter 0.4s ease",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              color: "#c8a96e",
              opacity: hovered ? 1.0 : 0.70,
              filter: hovered ? "brightness(1.3)" : "brightness(1)",
              transition: hovered ? "opacity 0.1s ease, filter 0.1s ease" : "opacity 0.4s ease, filter 0.4s ease",
            }}
          >
            {sw.icon}
          </div>
        )}
      </div>
      <span
        className="text-[8.5px] tracking-[0.3em] uppercase"
        style={{
          fontFamily: "Inter, sans-serif",
          color: hovered ? "var(--accent)" : isLight ? "rgba(26,26,26,0.40)" : "rgba(255,255,255,0.20)",
          transition: hovered ? "color 0.1s ease" : "color 0.4s ease",
        }}
      >
        {sw.name}
      </span>
    </div>
  );
}

// ── Per-letter text-shadow glow levels ────────────────────────────────────────
function makeGlow(r: number, g: number, b: number) {
  return {
    full: `0 0 30px rgba(${r},${g},${b},0.8), 0 0 60px rgba(${r},${g},${b},0.4), 0 0 100px rgba(${r},${g},${b},0.2)`,
    half: `0 0 30px rgba(${r},${g},${b},0.4), 0 0 60px rgba(${r},${g},${b},0.2), 0 0 100px rgba(${r},${g},${b},0.1)`,
    low:  `0 0 20px rgba(${r},${g},${b},0.08), 0 0 40px rgba(${r},${g},${b},0.04)`,
  };
}

function getLetterGlow(i: number, active: number | null, isLight: boolean): string | undefined {
  if (active === null) return undefined; // idle glow is handled by CSS keyframe animation
  const rgb = isLight ? [184, 148, 58] : [200, 169, 110];
  const g = makeGlow(rgb[0], rgb[1], rgb[2]);
  const d = Math.abs(i - active);
  if (d === 0) return g.full;
  if (d === 1) return g.half;
  return g.low;
}

export default function Hero() {
  const [showHint, setShowHint] = useState(true);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const section = useActiveSection();
  const { theme } = useTheme();
  const isLight = theme === "light";

  useEffect(() => {
    const handle = (e: Event) => {
      if ((e as CustomEvent<number>).detail !== 0) setShowHint(false);
    };
    window.addEventListener("snap-section", handle);
    return () => window.removeEventListener("snap-section", handle);
  }, []);

  return (
    <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden" style={{ backgroundColor: "var(--bg-primary)", transition: "background-color 0.4s ease" }}>

      {/* FloatingPaths background — two mirrored instances */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          color: isLight ? "rgba(15,23,42,0.75)" : "rgba(255,255,255,0.65)",
          transition: "color 0.4s ease",
        }}
      >
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)",
          zIndex: 6,
        }}
      />
      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
          zIndex: 6,
        }}
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.04]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="absolute top-0 bottom-0 w-px" style={{ left: `${(i + 1) * (100 / 7)}%`, background: "var(--text-primary)" }} />
        ))}
      </div>

      <div className="relative z-20 text-center px-6 select-none">

        {/* ── Name group ── */}
        <div className="flex flex-col items-center">
          <div style={{ opacity: section === 0 ? 1 : 0.08, transition: "opacity 0.7s ease" }}>
            <motion.h1
              id="coque-title"
              initial={{ opacity: 0, letterSpacing: "0.5em", y: 20 }}
              animate={{ opacity: 1, letterSpacing: "0.15em", y: 0 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(80px, 12vw, 160px)",
                color: "var(--accent)",
                textTransform: "uppercase",
                textAlign: "center",
                margin: "0 auto",
                lineHeight: 0.9,
              }}
            >
              {"COQUE".split("").map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ y: "110%", rotate: 8, opacity: 0 }}
                  animate={{ y: 0, rotate: 0, opacity: 1 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.3 + i * 0.06,
                    ease: [0.23, 1, 0.32, 1],
                  }}
                  onHoverStart={() => setActiveIdx(i)}
                  onHoverEnd={() => setActiveIdx(null)}
                  whileHover={{ y: -10, color: isLight ? "#1a1a1a" : "#ffffff", transition: { type: "spring", stiffness: 500, damping: 18 } }}
                  className={activeIdx === null ? (isLight ? "letter-glow-idle-light" : "letter-glow-idle") : ""}
                  style={{
                    display: "inline-block",
                    cursor: "default",
                    ...(activeIdx !== null ? { textShadow: getLetterGlow(i, activeIdx, isLight) } : {}),
                    transition: "text-shadow 0.2s ease",
                  }}
                >
                  {ch}
                </motion.span>
              ))}
            </motion.h1>
          </div>
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              color: "var(--text-primary)",
              fontSize: "clamp(12px, 1.5vw, 18px)",
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              marginTop: "1rem",
              display: "flex",
              gap: "0.5em",
              justifyContent: "center",
            }}
          >
            <span style={{ fontVariationSettings: "'wght' 100" }}>
              <SplitText text="VFX" stagger={0.03} charDuration={0.4} delay={1000} triggerOnMount />
            </span>
            <span style={{ fontVariationSettings: "'wght' 400", animation: "weight-pulse 3s ease-in-out 1.8s infinite" }}>
              <SplitText text="ARTIST" stagger={0.03} charDuration={0.4} delay={1200} triggerOnMount />
            </span>
          </p>
          {/* Animated gold line under subtitle */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 1.8, ease: [0.23, 1, 0.32, 1] }}
            className="origin-left h-px mt-3"
            style={{ background: "linear-gradient(90deg, transparent, var(--accent), transparent)", width: 120, margin: "0.75rem auto 0" }}
          />
        </div>

        {/* ── Subtitle group ── */}
        <motion.div className="mt-6">
          {/* Divider + tools */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="w-20 h-px bg-gold opacity-60" />
            <p className="text-xs tracking-[0.25em] text-white/50" style={{ fontFamily: "Inter, sans-serif" }}>
              Houdini&nbsp;·&nbsp;Karma&nbsp;·&nbsp;Nuke&nbsp;·&nbsp;Maya&nbsp;·&nbsp;Unreal Engine
            </p>
          </motion.div>

          {/* CTA — magnetic button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.65 }}
            className="mt-10 flex items-center justify-center"
          >
            <MagneticWrapper>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("snap-goto", { detail: 1 }))}
                className="btn-shine btn-press group flex items-center gap-3 text-xs tracking-[0.3em] uppercase border border-gold/50 hover:border-gold hover:bg-gold/10 text-gold px-8 py-4 transition-all duration-300"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                <svg className="w-3 h-3 fill-current" viewBox="0 0 12 12">
                  <polygon points="2,1 11,6 2,11" />
                </svg>
                Watch Showreel
              </button>
            </MagneticWrapper>
          </motion.div>

          {/* Software logos strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 2.1 }}
            className="mt-10 flex flex-col items-center"
          >
            <div className="w-28 h-px mb-8" style={{ background: "linear-gradient(90deg, transparent, var(--accent), transparent)", opacity: 0.4 }} />
            <div className="flex items-start justify-center gap-8">
              {HERO_SOFTWARE.map((sw) => (
                <HeroLogo key={sw.name} sw={sw} isLight={isLight} />
              ))}
            </div>
          </motion.div>
        </motion.div>

      </div>

      {/* Scroll hint — fades out once user navigates away */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showHint ? 1 : 0, y: showHint ? 0 : 12 }}
        transition={{ delay: showHint ? 2.2 : 0, duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        onClick={() => window.dispatchEvent(new CustomEvent("snap-goto", { detail: 1 }))}
        style={{ cursor: "pointer", zIndex: 10 }}
      >
        <span className="text-[9px] tracking-[0.4em] uppercase text-muted" style={{ fontFamily: "Inter, sans-serif" }}>
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-10 bg-gradient-to-b from-gold/60 to-transparent"
        />
      </motion.div>
    </section>
  );
}
