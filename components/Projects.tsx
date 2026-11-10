"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { SplitScramble } from "@/components/ui/split-text";

// Four disciplines that actually group the work (before: 8 categories for 10 projects)
const DISCIPLINES = ["ALL", "DESTRUCTION", "WATER & FLUIDS", "FIRE & SMOKE", "OTHER"] as const;
type Discipline = (typeof DISCIPLINES)[number];

type Project = {
  id: number;
  title: string;
  discipline: Exclude<Discipline, "ALL">;
  /** featured = the hero + side cards; archive = the compact strip below */
  tier: "featured" | "archive";
  /** one line on the card */
  tagline: string;
  /** full text, shown in the video modal */
  desc: string;
  techniques: string[];
  software: string[];
  breakdown: boolean;
  year: string;
  youtubeId: string;
};

// Ordered by strength, not by date: the first featured project is the big hero card
const projects: Project[] = [
  {
    id: 1,
    title: "FIGHTER JET IN THE RAIN",
    discipline: "WATER & FLUIDS",
    tier: "featured",
    tagline: "MPM water running over a fighter jet in a night storm.",
    desc: "A fighter jet parked in front of a hangar at night, in heavy rain — rain and splash particles, MPM water running over the aircraft and lightning, rendered in layers with Karma XPU and composited in Nuke with raindrops sliding on the lens. Includes a layer-by-layer breakdown.",
    techniques: ["MPM", "Rain particles", "Lens FX"],
    software: ["Houdini", "Karma", "Nuke"],
    breakdown: true,
    year: "2026",
    youtubeId: "IB88b5-tjHg",
  },
  {
    id: 2,
    title: "TANK NIGHT BATTLE",
    discipline: "FIRE & SMOKE",
    tier: "featured",
    tagline: "MPM mud, tracers and a cannon blast at night.",
    desc: "A tank pushes through the mud at night under fire — MPM mud thrown by the tracks, tracer rounds, a ricochet off the armor, ground impacts and a cannon blast, rendered in layers with Karma XPU and finished in Nuke. Includes a layer-by-layer breakdown.",
    techniques: ["MPM mud", "Pyro", "Tracers"],
    software: ["Houdini", "Karma", "Nuke"],
    breakdown: true,
    year: "2026",
    youtubeId: "0O51ZQiaxtc",
  },
  {
    id: 3,
    title: "NIGHT ROLLOVER",
    discipline: "DESTRUCTION",
    tier: "featured",
    tagline: "Vellum sheet metal on a Bullet rollover.",
    desc: "A car skids on a wet street at night, trips over the curb, takes out a road sign and lands on its roof — Vellum sheet metal with plasticity on a Bullet rollover, tempered glass shatter, tire smoke and sparks, rendered in layers with Karma XPU. Includes a pass-by-pass breakdown.",
    techniques: ["Vellum", "RBD", "Glass"],
    software: ["Houdini", "Karma"],
    breakdown: true,
    year: "2026",
    youtubeId: "TY_tHvEAf8s",
  },
  {
    id: 4,
    title: "GIDEON TELEPORT",
    discipline: "FIRE & SMOKE",
    tier: "featured",
    tagline: "Magic energy, purple pyro and a dust disintegration.",
    desc: "Gideon gathers energy, levitates and disintegrates into dust as he teleports away — energy strands, purple Pyro fire and 867k dust particles in a procedural ruined temple. Includes a layer-by-layer breakdown.",
    techniques: ["Pyro", "Particles", "Magic FX"],
    software: ["Houdini", "Karma", "Nuke"],
    breakdown: true,
    year: "2026",
    youtubeId: "s2YE5GiN7VI",
  },
  {
    id: 5,
    title: "MOUNTAIN RIVER RAPIDS",
    discipline: "WATER & FLUIDS",
    tier: "archive",
    tagline: "FLIP rapids with foam, spray and bubbles.",
    desc: "Mountain river rapids — a 6.4M-particle FLIP simulation with foam, spray and bubbles over scanned rocks, rendered in layers with Karma XPU. Includes a layer-by-layer breakdown.",
    techniques: ["FLIP", "Whitewater"],
    software: ["Houdini", "Karma", "Nuke"],
    breakdown: true,
    year: "2026",
    youtubeId: "B4c9qWHtxd8",
  },
  {
    id: 6,
    title: "GROUND DESTRUCTION",
    discipline: "DESTRUCTION",
    tier: "archive",
    tagline: "Procedural RBD ground fracture.",
    desc: "RBD ground fracture simulation in Houdini — procedural fracturing, rigid body dynamics and a Karma render.",
    techniques: ["RBD", "Fracture"],
    software: ["Houdini", "Karma"],
    breakdown: false,
    year: "2026",
    youtubeId: "EDasAkp61AU",
  },
  {
    id: 7,
    title: "DINO WATERFALL",
    discipline: "WATER & FLUIDS",
    tier: "archive",
    tagline: "A dinosaur crossing a river under a waterfall.",
    desc: "FLIP water and whitewater simulation in Houdini — a dinosaur crossing a river beneath a waterfall. Includes a simulation breakdown.",
    techniques: ["FLIP", "Whitewater"],
    software: ["Houdini", "Nuke", "Maya", "Premiere"],
    breakdown: true,
    year: "2026",
    youtubeId: "_sHke4iLrjg",
  },
  {
    id: 8,
    title: "CITY MUSTANG",
    discipline: "OTHER",
    tier: "archive",
    tagline: "Real-time cinematic in Unreal Engine.",
    desc: "A Mustang driving through the city — cinematic real-time sequence built and rendered in Unreal Engine, finished in Nuke.",
    techniques: ["Unreal Engine", "Cinematic"],
    software: ["Unreal Engine", "Nuke"],
    breakdown: false,
    year: "2026",
    youtubeId: "5OiXs6pik64",
  },
  {
    id: 9,
    title: "NATURE TAKEOVER",
    discipline: "OTHER",
    tier: "archive",
    tagline: "Nature reclaims a city.",
    desc: "Nature reclaims an urban environment — procedural growth, destruction and atmospheric FX simulation.",
    techniques: ["Procedural growth"],
    software: ["Houdini", "Nuke"],
    breakdown: true,
    year: "2025",
    youtubeId: "ECXjw5t7fQI",
  },
  {
    id: 10,
    title: "FERRARI AND SHIP COMPO",
    discipline: "OTHER",
    tier: "archive",
    tagline: "CG Ferrari integrated into a live-action plate.",
    desc: "Full compositing pipeline combining Ferrari CGI with live-action ship plate — lighting, integration and final grade.",
    techniques: ["Compositing", "Integration"],
    software: ["Houdini", "Nuke", "Maya"],
    breakdown: false,
    year: "2025",
    youtubeId: "Y6ztIPGr6_Q",
  },
];

const THUMB_QUALITIES = ["maxresdefault", "sddefault", "hqdefault"] as const;
const SANS = { fontFamily: "Inter, sans-serif" } as const;
const BEBAS = { fontFamily: "'Bebas Neue', sans-serif" } as const;

// ── Thumbnail with a muted video preview on hover ────────────────────────────

function Thumb({ p, hovered, preview = true }: { p: Project; hovered: boolean; preview?: boolean }) {
  // maxresdefault doesn't exist for every video — YouTube serves a 120px placeholder instead,
  // so step down to the next quality when that happens.
  const [q, setQ] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const check = (img: HTMLImageElement) => {
    if (img.naturalWidth <= 120) setQ((v) => Math.min(v + 1, THUMB_QUALITIES.length - 1));
  };
  // The page is prerendered, so the image can finish loading before hydration and onLoad never fires.
  useEffect(() => {
    if (imgRef.current?.complete) check(imgRef.current);
  }, [q]);

  return (
    <>
      <img
        ref={imgRef}
        src={`https://img.youtube.com/vi/${p.youtubeId}/${THUMB_QUALITIES[q]}.jpg`}
        alt={p.title}
        onLoad={(e) => check(e.currentTarget)}
        onError={(e) => check(e.currentTarget)}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.03]"
        style={{ opacity: hovered && preview ? 0 : 1 }}
      />
      {hovered && preview && (
        <iframe
          className="absolute inset-0 w-full h-full yt-bg-player pointer-events-none"
          src={`https://www.youtube.com/embed/${p.youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${p.youtubeId}&modestbranding=1&rel=0&playsinline=1`}
          allow="autoplay"
        />
      )}
    </>
  );
}

function Chips({ items, small = false }: { items: string[]; small?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <span
          key={t}
          className={`${small ? "text-[8px] px-1.5" : "text-[9px] px-2"} tracking-wider border border-gold/30 text-gold/80 py-0.5 rounded-full`}
          style={SANS}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

function Badges({ p }: { p: Project }) {
  return (
    <div className="flex items-center gap-2">
      <span className="bg-gold text-black text-[9px] tracking-widest uppercase px-2.5 py-1 font-semibold" style={SANS}>
        {p.discipline}
      </span>
      {p.breakdown && (
        <span className="border border-white/40 text-white/85 text-[9px] tracking-widest uppercase px-2 py-[3px] backdrop-blur-sm bg-black/30" style={SANS}>
          Breakdown
        </span>
      )}
    </div>
  );
}

function PlayIcon({ show, size = 56 }: { show: boolean; size?: number }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
      <motion.div
        animate={{ scale: show ? 1 : 0.85, opacity: show ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="rounded-full border border-gold/60 bg-black/40 flex items-center justify-center backdrop-blur-sm"
        style={{ width: size, height: size }}
      >
        <svg className="text-gold ml-0.5" style={{ width: size * 0.36, height: size * 0.36 }} fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </motion.div>
    </div>
  );
}

function useHover() {
  const [hovered, setHovered] = useState(false);
  return { hovered, bind: { onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) } };
}

const enter = (i: number, inView: boolean) => ({
  initial: { opacity: 0, y: 24 },
  animate: inView ? { opacity: 1, y: 0 } : {},
  transition: { duration: 0.65, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
});

// ── Hero card: the strongest project, big, with the text over the image ──────

function HeroCard({ p, onOpen }: { p: Project; onOpen: (p: Project) => void }) {
  const { hovered, bind } = useHover();
  const { ref, inView } = useInView({ threshold: 0.08, triggerOnce: true });
  return (
    <SpotlightCard glowColor="gold" customSize className="w-full h-full">
      <motion.article
        ref={ref}
        {...enter(0, inView)}
        {...bind}
        onClick={() => onOpen(p)}
        className="group relative h-full min-h-[260px] overflow-hidden border border-gold/25 hover:border-gold/60 transition-colors duration-500 cursor-pointer"
        style={{ backgroundColor: "var(--bg-tertiary)" }}
      >
        <div className="relative w-full h-full aspect-video lg:aspect-auto">
          <Thumb p={p} hovered={hovered} />
          {/* bottom gradient for the text */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 40%, transparent 70%)" }} />
          <div className="absolute top-4 left-4 z-10"><Badges p={p} /></div>
          <div className="absolute top-4 right-4 z-10 text-[9px] tracking-widest text-white/60" style={SANS}>{p.year}</div>
          <PlayIcon show={hovered} size={64} />
          <div className="absolute bottom-0 inset-x-0 p-6 z-10">
            <p className="text-[9px] tracking-[0.45em] uppercase text-gold mb-2" style={SANS}>Featured</p>
            <h3 className="text-[clamp(1.8rem,3.2vw,3rem)] leading-none tracking-wider text-white mb-2" style={BEBAS}>{p.title}</h3>
            <p className="text-sm text-white/75 mb-3 max-w-xl" style={SANS}>{p.tagline}</p>
            <Chips items={p.techniques} />
          </div>
          <div className="absolute top-0 inset-x-0 h-px origin-left z-20 transition-transform duration-500" style={{ background: "var(--accent)", transform: hovered ? "scaleX(1)" : "scaleX(0)" }} />
        </div>
      </motion.article>
    </SpotlightCard>
  );
}

// ── Side card: medium, thumbnail left + text right ───────────────────────────

function SideCard({ p, i, onOpen }: { p: Project; i: number; onOpen: (p: Project) => void }) {
  const { hovered, bind } = useHover();
  const { ref, inView } = useInView({ threshold: 0.08, triggerOnce: true });
  return (
    <motion.article
      ref={ref}
      {...enter(i, inView)}
      {...bind}
      onClick={() => onOpen(p)}
      className="group relative flex-1 min-h-0 flex overflow-hidden border border-gold/20 hover:border-gold/50 transition-colors duration-500 cursor-pointer"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <div className="relative w-[46%] shrink-0 aspect-video self-center overflow-hidden" style={{ backgroundColor: "var(--bg-tertiary)" }}>
        <Thumb p={p} hovered={hovered} />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all duration-500" />
        <PlayIcon show={hovered} size={40} />
      </div>
      <div className="flex-1 min-w-0 p-4 flex flex-col justify-center gap-1.5">
        <p className="text-[8px] tracking-[0.35em] uppercase text-gold" style={SANS}>
          {p.discipline}{p.breakdown ? " · Breakdown" : ""}
        </p>
        <h3 className="text-xl leading-none tracking-wider text-white transition-colors duration-300 group-hover:text-gold" style={BEBAS}>
          {p.title}
        </h3>
        <p className="text-[11px] text-muted leading-snug" style={SANS}>{p.tagline}</p>
      </div>
      <div className="absolute bottom-0 inset-x-0 h-px origin-left transition-transform duration-500" style={{ background: "var(--accent)", transform: hovered ? "scaleX(1)" : "scaleX(0)" }} />
    </motion.article>
  );
}

// ── Grid card: used when a discipline filter is on ───────────────────────────

function GridCard({ p, i, onOpen }: { p: Project; i: number; onOpen: (p: Project) => void }) {
  const { hovered, bind } = useHover();
  const { ref, inView } = useInView({ threshold: 0.08, triggerOnce: true });
  return (
    <SpotlightCard glowColor="gold" customSize className="w-full">
      <motion.article
        ref={ref}
        {...enter(i, inView)}
        {...bind}
        onClick={() => onOpen(p)}
        className="group relative overflow-hidden border border-gold/20 hover:border-gold/50 transition-colors duration-500 cursor-pointer"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <div className="relative aspect-video overflow-hidden" style={{ backgroundColor: "var(--bg-tertiary)" }}>
          <Thumb p={p} hovered={hovered} />
          <div className="absolute inset-0 bg-black/25 group-hover:bg-black/5 transition-all duration-500" />
          <div className="absolute top-3 left-3 z-10"><Badges p={p} /></div>
          <div className="absolute top-3 right-3 z-10 text-[9px] tracking-widest text-white/60" style={SANS}>{p.year}</div>
          <PlayIcon show={hovered} />
        </div>
        <div className="p-5">
          <h3 className="text-2xl tracking-wider text-white mb-1 transition-colors duration-300 group-hover:text-gold" style={BEBAS}>{p.title}</h3>
          <p className="text-xs text-muted leading-relaxed mb-3" style={SANS}>{p.tagline}</p>
          <Chips items={p.techniques} />
        </div>
      </motion.article>
    </SpotlightCard>
  );
}

// ── Archive card: compact thumbnail with the title on it ─────────────────────

function ArchiveCard({ p, i, onOpen }: { p: Project; i: number; onOpen: (p: Project) => void }) {
  const { hovered, bind } = useHover();
  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true });
  return (
    <motion.article
      ref={ref}
      {...enter(i, inView)}
      {...bind}
      onClick={() => onOpen(p)}
      className="group relative aspect-video overflow-hidden border border-gold/15 hover:border-gold/50 transition-colors duration-500 cursor-pointer"
      style={{ backgroundColor: "var(--bg-tertiary)" }}
      title={p.tagline}
    >
      <Thumb p={p} hovered={hovered} preview={false} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent 65%)" }} />
      <div className="absolute bottom-0 inset-x-0 p-2.5 z-10">
        <p className="text-[7px] tracking-[0.3em] uppercase text-gold/90 mb-0.5" style={SANS}>{p.discipline}</p>
        <h4 className="text-sm leading-none tracking-wider text-white group-hover:text-gold transition-colors duration-300" style={BEBAS}>{p.title}</h4>
      </div>
      <PlayIcon show={hovered} size={34} />
    </motion.article>
  );
}

// ── Video modal (one for the whole section) ──────────────────────────────────

function VideoModal({ p, onClose }: { p: Project | null; onClose: () => void }) {
  useEffect(() => {
    if (!p) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [p, onClose]);

  return (
    <AnimatePresence>
      {p && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 flex items-center justify-center overflow-y-auto py-8"
          style={{ zIndex: 99999, background: "rgba(0,0,0,0.92)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 20 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="w-[90vw] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3 px-1">
              <h3 className="text-2xl tracking-wider text-white" style={BEBAS}>{p.title}</h3>
              <button onClick={onClose} className="text-muted hover:text-white transition-colors text-xs tracking-widest uppercase" style={SANS}>
                ESC to close
              </button>
            </div>
            <div className="relative aspect-video bg-black border border-white/10">
              <iframe
                src={`https://www.youtube.com/embed/${p.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="mt-4 px-1 grid md:grid-cols-[1fr_auto] gap-4 items-start">
              <p className="text-sm text-white/70 leading-relaxed" style={SANS}>{p.desc}</p>
              <div className="flex flex-col gap-2 md:items-end">
                <Chips items={p.techniques} />
                <p className="text-[10px] tracking-[0.25em] uppercase text-white/40" style={SANS}>{p.software.join(" · ")} · {p.year}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Energy Streams particle background ───────────────────────────────────────

type StreamDef = {
  yFrac:     number;
  amplitude: number;
  frequency: number;
  speed:     number;
  color:     string;
  count:     number;
};

type StreamParticle = {
  streamIdx: number;
  t:         number;
  size:      number;
  brightness: number;
};

function EnergyStreamsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const rand = (a: number, b: number) => Math.random() * (b - a) + a;

    // Reduced to 7 particles per stream × 7 streams ≈ 60 total (was ~120)
    const STREAMS: StreamDef[] = [
      { yFrac: 0.12, amplitude: 38, frequency: 1.4, speed: 0.00110, color: "90,202,134", count: 8 },
      { yFrac: 0.25, amplitude: 55, frequency: 1.1, speed: 0.00085, color: "255,255,255", count: 8 },
      { yFrac: 0.38, amplitude: 42, frequency: 1.7, speed: 0.00130, color: "180,100,50",  count: 8 },
      { yFrac: 0.50, amplitude: 60, frequency: 0.9, speed: 0.00070, color: "90,202,134", count: 9 },
      { yFrac: 0.62, amplitude: 35, frequency: 1.5, speed: 0.00100, color: "255,255,255", count: 8 },
      { yFrac: 0.74, amplitude: 50, frequency: 1.2, speed: 0.00095, color: "180,100,50",  count: 8 },
      { yFrac: 0.86, amplitude: 44, frequency: 1.6, speed: 0.00120, color: "90,202,134", count: 8 },
    ];

    const phaseOffsets = STREAMS.map(() => rand(0, Math.PI * 2));

    const particles: StreamParticle[] = STREAMS.flatMap((s, si) =>
      Array.from({ length: s.count }, (_, pi) => ({
        streamIdx: si,
        t: pi / s.count,
        size: rand(2, 4),
        brightness: Math.random(),
      }))
    );

    const streamPos = (si: number, t: number, time: number): [number, number] => {
      const s = STREAMS[si];
      const W = canvas.width;
      const H = canvas.height;
      const x = t * (W + 40) - 20;
      const phase = phaseOffsets[si] + time * s.speed * W * 0.018;
      const y = s.yFrac * H + Math.sin(t * s.frequency * Math.PI * 2 + phase) * s.amplitude;
      return [x, y];
    };

    // Pause tracking — off when tab hidden or section not visible
    let paused = false;
    let isWorkSection = false;

    const updatePause = () => {
      paused = document.hidden || !isWorkSection;
    };

    const onVisibility = () => updatePause();
    document.addEventListener("visibilitychange", onVisibility);

    const onSection = (e: Event) => {
      isWorkSection = (e as CustomEvent<number>).detail === 2;
      updatePause();
    };
    window.addEventListener("snap-section", onSection);

    let time = 0;
    let raf: number;

    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (paused) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        const s = STREAMS[p.streamIdx];
        p.t += s.speed;
        if (p.t > 1) p.t -= 1;
      }

      for (const p of particles) {
        const s = STREAMS[p.streamIdx];
        const [x, y] = streamPos(p.streamIdx, p.t, time);

        const headness = Math.sin(p.t * Math.PI);
        const baseAlpha = 0.25 + headness * 0.60;

        let alpha: number;
        if (s.color === "90,202,134") {
          alpha = baseAlpha * 0.9;
        } else if (s.color === "255,255,255") {
          alpha = baseAlpha * 0.55;
        } else {
          alpha = baseAlpha * 0.70;
        }

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowBlur  = 8;
        ctx.shadowColor = `rgba(${s.color},${alpha})`;
        ctx.fillStyle   = `rgba(${s.color},1)`;
        ctx.beginPath();
        ctx.arc(x, y, p.size * (0.7 + headness * 0.5), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      time++;
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
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}

// ── Main Section ──────────────────────────────────────────────────────────────
// ALL: one big featured project + the other featured ones beside it, and the archive as a compact strip below.
// A discipline filter shows just that discipline as a plain grid.

export default function Projects() {
  const [active, setActive] = useState<Discipline>("ALL");
  const [open, setOpen] = useState<Project | null>(null);
  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true });

  const featured = projects.filter((p) => p.tier === "featured");
  const archive = projects.filter((p) => p.tier === "archive");
  const filtered = active === "ALL" ? projects : projects.filter((p) => p.discipline === active);
  const disciplines = DISCIPLINES.filter((d) => d === "ALL" || projects.some((p) => p.discipline === d));
  const count = (d: Discipline) => (d === "ALL" ? projects.length : projects.filter((p) => p.discipline === d).length);

  return (
    <section id="work" className="relative h-screen overflow-hidden flex flex-col" style={{ backgroundColor: "var(--bg-primary)", transition: "background-color 0.4s ease" }}>
      <EnergyStreamsCanvas />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--bg-primary)", opacity: 0.88, zIndex: 2 }} />

      <div className="relative flex-1 overflow-y-auto overscroll-contain" style={{ zIndex: 10 }}>
        <div className="max-w-[1400px] mx-auto px-8 pt-16 pb-8">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="mb-5 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4"
          >
            <div>
              <p className="text-[10px] tracking-[0.5em] uppercase text-gold mb-1" style={SANS}>Portfolio</p>
              <div className="flex items-baseline gap-4">
                <h2 className="text-[clamp(2rem,5vw,4rem)] leading-none text-white tracking-wide" style={BEBAS}>
                  <SplitScramble text="SELECTED WORK" stagger={0.05} />
                </h2>
                <span className="text-[9px] tracking-[0.4em] uppercase text-gold/40 hidden md:block" style={SANS}>
                  {String(projects.length).padStart(2, "0")} PROJECTS
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {disciplines.map((d) => (
                <button
                  key={d}
                  onClick={() => setActive(d)}
                  className={`text-[9px] tracking-[0.3em] uppercase px-4 py-2.5 border transition-all duration-300 ${
                    active === d ? "border-gold bg-gold/10 text-gold" : "border-gold/20 text-muted hover:border-gold/40 hover:text-white/60"
                  }`}
                  style={SANS}
                >
                  {d} <span className="opacity-50 ml-1">{count(d)}</span>
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.9 }}
            className="origin-left h-px bg-gold/20 mb-5"
          />

          <AnimatePresence mode="wait">
            {active === "ALL" ? (
              <motion.div key="all" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                {/* Featured: hero + side column */}
                <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-4 lg:h-[min(56vh,560px)]">
                  <HeroCard p={featured[0]} onOpen={setOpen} />
                  <div className="flex flex-col gap-3 min-h-0">
                    {featured.slice(1).map((p, i) => (
                      <SideCard key={p.id} p={p} i={i + 1} onOpen={setOpen} />
                    ))}
                  </div>
                </div>

                {/* Archive */}
                <div className="mt-6">
                  <div className="flex items-center gap-4 mb-3">
                    <p className="text-[9px] tracking-[0.45em] uppercase text-gold/70 whitespace-nowrap" style={SANS}>More work</p>
                    <div className="h-px flex-1 bg-gold/15" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                    {archive.map((p, i) => (
                      <ArchiveCard key={p.id} p={p} i={i} onOpen={setOpen} />
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={active}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 pb-4"
              >
                {filtered.map((p, i) => (
                  <GridCard key={p.id} p={p} i={i} onOpen={setOpen} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <VideoModal p={open} onClose={() => setOpen(null)} />
    </section>
  );
}
