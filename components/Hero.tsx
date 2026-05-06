"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Player } from "@remotion/player";
import MagneticWrapper from "./MagneticWrapper";
import { TrackingIn } from "./ui/tracking-in";

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

type HeroSW = { name: string; slug?: string; icon: React.ReactNode };

const HERO_SOFTWARE: HeroSW[] = [
  { name: "Houdini", slug: "houdini",      icon: <IconHoudini /> },
  { name: "Maya",    slug: "autodesk",     icon: <IconMaya /> },
  { name: "Nuke",    slug: undefined,      icon: <IconNuke /> },
  { name: "Unreal",  slug: "unrealengine", icon: <IconUnreal /> },
  { name: "ComfyUI", slug: undefined,      icon: <IconComfy /> },
];

function HeroLogo({ sw }: { sw: HeroSW }) {
  const [failed, setFailed] = useState(false);
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
        willChange: "transform",
        boxShadow: hovered ? "0 20px 40px rgba(200,169,110,0.4)" : "0 0 0 rgba(0,0,0,0)",
      }}
    >
      {/* 70×70px logo */}
      <div
        style={{
          width: 70,
          height: 70,
          color: "#c8a96e",
          opacity: hovered ? 0.75 : 0.48,
          filter: hovered ? "brightness(1.3)" : "brightness(1)",
          transition: hovered ? "opacity 0.1s ease, filter 0.1s ease" : "opacity 0.4s ease, filter 0.4s ease",
        }}
      >
        {sw.slug && !failed ? (
          <img
            src={`https://cdn.simpleicons.org/${sw.slug}/c8a96e`}
            alt={sw.name}
            width={70}
            height={70}
            onError={() => setFailed(true)}
            className="w-full h-full object-contain"
          />
        ) : (
          sw.icon
        )}
      </div>
      <span
        className="text-[8.5px] tracking-[0.3em] uppercase"
        style={{
          fontFamily: "Inter, sans-serif",
          color: hovered ? "rgba(200,169,110,0.6)" : "rgba(255,255,255,0.20)",
          transition: hovered ? "color 0.1s ease" : "color 0.4s ease",
        }}
      >
        {sw.name}
      </span>
    </div>
  );
}

const HeroTitle: React.FC = () => (
  <TrackingIn
    text="ALVARO CAVERO"
    startTracking={0.8}
    startBlur={16}
    fontSize={96}
    color="#ffffff"
    background="transparent"
    fontWeight={700}
    speed={0.8}
  />
);

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    type Particle = {
      x: number; y: number;
      vx: number; vy: number;
      size: number; alpha: number;
      life: number; maxLife: number;
    };

    const particles: Particle[] = [];
    const count = 120;

    const make = (): Particle => ({
      x: Math.random() * canvas.width,
      y: canvas.height + 20,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(Math.random() * 0.6 + 0.2),
      size: Math.random() * 80 + 30,
      alpha: Math.random() * 0.06 + 0.02,
      life: 0,
      maxLife: Math.random() * 400 + 300,
    });

    for (let i = 0; i < count; i++) {
      const p = make();
      p.life = Math.floor(Math.random() * p.maxLife);
      p.y = Math.random() * canvas.height;
      particles.push(p);
    }

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        const t = p.life / p.maxLife;
        const a = t < 0.2 ? (t / 0.2) * p.alpha : t > 0.7 ? ((1 - t) / 0.3) * p.alpha : p.alpha;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grad.addColorStop(0, `rgba(200,169,110,${a * 0.4})`);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        if (p.life >= p.maxLife) particles[i] = make();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-bg">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.04]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="absolute top-0 bottom-0 w-px bg-white" style={{ left: `${(i + 1) * (100 / 7)}%` }} />
        ))}
      </div>

      <div className="relative z-10 text-center px-6 select-none">

        {/* ── Name group ── */}
        <div>
          <Player
            component={HeroTitle}
            durationInFrames={90}
            fps={30}
            compositionWidth={1200}
            compositionHeight={200}
            controls={false}
            autoPlay
            loop={false}
            acknowledgeRemotionLicense
            style={{ width: "100%", height: "auto", background: "transparent" }}
          />
        </div>

        {/* ── Subtitle group ── */}
        <motion.div className="mt-6">
          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.4 }}
            className="flex flex-col items-center gap-3"
          >
            <p className="text-xs tracking-[0.55em] uppercase text-gold" style={{ fontFamily: "Inter, sans-serif" }}>
              VFX Artist
            </p>
            <div className="w-20 h-px bg-gold opacity-60" />
            <p className="text-xs tracking-[0.25em] text-white/50" style={{ fontFamily: "Inter, sans-serif" }}>
              Houdini&nbsp;·&nbsp;Karma&nbsp;·&nbsp;Nuke&nbsp;·&nbsp;Maya&nbsp;·&nbsp;Unreal Engine
            </p>
          </motion.div>

          {/* CTA — magnetic button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.65 }}
            className="mt-10 flex items-center justify-center"
          >
            <MagneticWrapper>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("snap-goto", { detail: 1 }))}
                className="group flex items-center gap-3 text-xs tracking-[0.3em] uppercase border border-gold/50 hover:border-gold hover:bg-gold/10 text-gold px-8 py-4 transition-all duration-400"
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
            transition={{ duration: 1.2, delay: 3.1 }}
            className="mt-10 flex flex-col items-center"
          >
            <div className="w-28 h-px mb-8" style={{ background: "rgba(255,255,255,0.07)" }} />
            <div className="flex items-start justify-center gap-8">
              {HERO_SOFTWARE.map((sw) => (
                <HeroLogo key={sw.name} sw={sw} />
              ))}
            </div>
          </motion.div>
        </motion.div>

      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        onClick={() => window.dispatchEvent(new CustomEvent("snap-goto", { detail: 1 }))}
        style={{ cursor: "pointer" }}
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
