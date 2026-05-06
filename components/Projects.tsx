"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { SpotlightCard } from "@/components/ui/spotlight-card";

const CATEGORIES = ["ALL", "COMPOSITING", "PYRO & FIRE", "WATER & FLUIDS", "DESTRUCTION", "CHARACTER FX", "ENVIRONMENTS"] as const;
type Category = (typeof CATEGORIES)[number];

type BaseProject = {
  id: number;
  title: string;
  category: Category;
  software: string[];
  desc: string;
  year: string;
};

type VimeoProject = BaseProject & { vimeoId: string };
type PlaceholderProject = BaseProject & { vimeoId?: never };
type Project = VimeoProject | PlaceholderProject;

const projects: Project[] = [
  {
    id: 1,
    title: "FERRARI AND SHIP COMPO",
    category: "COMPOSITING",
    software: ["Houdini", "Nuke", "Maya"],
    vimeoId: "1089906860",
    desc: "Full compositing pipeline combining Ferrari CGI with live-action ship plate — lighting, integration and final grade.",
    year: "2025",
  },
  {
    id: 2,
    title: "DRAGON BATTLE",
    category: "CHARACTER FX",
    software: ["Houdini", "Karma"],
    desc: "Full creature FX pipeline with procedural scales, fire breath and cloth simulation.",
    year: "2024",
  },
  {
    id: 3,
    title: "HELICOPTER ISLAND",
    category: "ENVIRONMENTS",
    software: ["Houdini", "Karma", "ComfyUI"],
    desc: "Large-scale procedural island environment with atmospheric FX and rotor wash.",
    year: "2024",
  },
  {
    id: 4,
    title: "WATERFALL",
    category: "WATER & FLUIDS",
    software: ["Houdini", "FLIP", "Karma"],
    desc: "FLIP fluid waterfall with whitewater, foam and mist volumes rendered with Karma XPU.",
    year: "2024",
  },
  {
    id: 5,
    title: "DESTRUCTION RIG",
    category: "DESTRUCTION",
    software: ["Houdini", "RBD", "Karma"],
    desc: "Procedural constraint network for photorealistic building demolition.",
    year: "2024",
  },
  {
    id: 6,
    title: "BURNING CLOTH",
    category: "CHARACTER FX",
    software: ["Houdini", "Vellum", "Karma"],
    desc: "Vellum cloth destruction with integrated pyro for burning fabric simulation.",
    year: "2025",
  },
];

// ── Vimeo Card ────────────────────────────────────────────────────────────────

function VimeoCard({ p, i }: { p: VimeoProject; i: number }) {
  const [hovered, setHovered] = useState(false);
  const [modal, setModal] = useState(false);
  const [thumb, setThumb] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<import("@vimeo/player").default | null>(null);
  const { ref, inView } = useInView({ threshold: 0.08, triggerOnce: true });

  // Fetch thumbnail
  useEffect(() => {
    fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${p.vimeoId}`)
      .then((r) => r.json())
      .then((data) => {
        const url: string = data.thumbnail_url ?? "";
        setThumb(url.replace(/_\d+x\d+(\.\w+)$/, "_1280x720$1"));
      })
      .catch(() => {});
  }, [p.vimeoId]);

  // Vimeo background player
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let player: import("@vimeo/player").default;
    import("@vimeo/player").then(({ default: VimeoPlayer }) => {
      player = new VimeoPlayer(el, {
        id: parseInt(p.vimeoId),
        background: true,
        loop: true,
        dnt: true,
        muted: true,
      });
      player.ready().then(() => player.pause()).catch(() => {});
      playerRef.current = player;
    });
    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [p.vimeoId]);

  // Play/pause on hover
  useEffect(() => {
    if (!playerRef.current) return;
    if (hovered) {
      playerRef.current.play().catch(() => {});
    } else {
      playerRef.current.pause().catch(() => {});
    }
  }, [hovered]);

  // Modal ESC
  useEffect(() => {
    if (!modal) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setModal(false); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [modal]);

  return (
    <>
      <SpotlightCard glowColor="gold" customSize className="w-full">
        <motion.article
          ref={ref}
          initial={{ opacity: 0, scale: 0.95, y: 24 }}
          animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="group relative overflow-hidden bg-[#111111] border border-gold/20 hover:border-gold/50 transition-all duration-500 cursor-pointer"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => setModal(true)}
        >
          {/* Thumbnail area */}
          <div className="relative aspect-video overflow-hidden bg-[#0a0a0a]">
            {/* Static thumbnail */}
            {thumb && (
              <img
                src={thumb}
                alt={p.title}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                style={{ opacity: hovered ? 0 : 1 }}
              />
            )}

            {/* Vimeo background player container */}
            <div
              ref={containerRef}
              className="absolute inset-0 w-full h-full vimeo-bg-player"
              style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.5s ease" }}
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all duration-500" />

            {/* Category badge */}
            <div className="absolute top-3 left-3 z-10">
              <span
                className="bg-gold text-black text-[9px] tracking-widest uppercase px-2.5 py-1 font-semibold"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {p.category}
              </span>
            </div>
            <div className="absolute top-3 right-3 z-10">
              <span className="text-[9px] tracking-widest text-white/60" style={{ fontFamily: "Inter, sans-serif" }}>
                {p.year}
              </span>
            </div>

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <motion.div
                animate={{ scale: hovered ? 1 : 0.85, opacity: hovered ? 1 : 0 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="w-14 h-14 rounded-full border border-gold/60 bg-black/40 flex items-center justify-center backdrop-blur-sm"
              >
                <svg className="w-5 h-5 text-gold ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </motion.div>
            </div>
          </div>

          {/* Info */}
          <div className="p-5">
            <h3
              className="text-2xl tracking-wider text-white mb-1 transition-colors duration-300 group-hover:text-gold"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              {p.title}
            </h3>
            <p className="text-xs text-muted leading-relaxed mb-4" style={{ fontFamily: "Inter, sans-serif" }}>
              {p.desc}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {p.software.map((sw) => (
                <span
                  key={sw}
                  className="text-[9px] tracking-wider border border-gold/30 text-gold/70 px-2 py-0.5 rounded-full"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {sw}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom gold glow on hover */}
          <motion.div
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            className="absolute bottom-0 inset-x-0 h-px bg-gold/60"
          />
        </motion.article>
      </SpotlightCard>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 flex items-center justify-center"
            style={{ zIndex: 99999, background: "rgba(0,0,0,0.92)" }}
            onClick={() => setModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="w-[90vw] max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <div className="flex justify-between items-center mb-3 px-1">
                <h3
                  className="text-2xl tracking-wider text-white"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  {p.title}
                </h3>
                <button
                  onClick={() => setModal(false)}
                  className="text-muted hover:text-white transition-colors text-xs tracking-widest uppercase"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  ESC to close
                </button>
              </div>

              <div className="relative aspect-video bg-black border border-white/10">
                <iframe
                  src={`https://player.vimeo.com/video/${p.vimeoId}?autoplay=1&title=0&byline=0&portrait=0&dnt=1`}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Placeholder Card ──────────────────────────────────────────────────────────

function ProjectCard({ p, i }: { p: PlaceholderProject; i: number }) {
  const [hovered, setHovered] = useState(false);
  const { ref, inView } = useInView({ threshold: 0.08, triggerOnce: true });

  return (
    <SpotlightCard glowColor="blue" customSize className="w-full">
      <motion.article
        ref={ref}
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
        transition={{ duration: 0.65, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="group relative overflow-hidden bg-[#111111] border border-white/[0.06] hover:border-gold/30 transition-all duration-500"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Thumbnail — Coming Soon placeholder */}
        <div className="relative aspect-video overflow-hidden bg-[#0a0a0a] flex flex-col items-center justify-center gap-3">
          {/* Rotating dashed border */}
          <div
            className="absolute pointer-events-none"
            style={{ inset: 10, animation: "border-spin 14s linear infinite" }}
          >
            <div style={{ width: "100%", height: "100%", border: "1px dashed rgba(200,169,110,0.22)" }} />
          </div>

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span
              className="bg-gold text-black text-[9px] tracking-widest uppercase px-2.5 py-1 font-semibold"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {p.category}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span className="text-[9px] tracking-widest text-white/40" style={{ fontFamily: "Inter, sans-serif" }}>
              {p.year}
            </span>
          </div>

          {/* Coming Soon label */}
          <span
            className="text-[10px] tracking-[0.45em] uppercase"
            style={{ fontFamily: "Inter, sans-serif", color: "#c8a96e", animation: "cs-pulse 2.4s ease-in-out infinite" }}
          >
            Coming Soon
          </span>
          <motion.div
            animate={{ scaleX: hovered ? 1 : 0.4, opacity: hovered ? 0.7 : 0.3 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="h-px bg-gold origin-center"
            style={{ width: 48 }}
          />
        </div>

        {/* Info */}
        <div className="p-5">
          <h3
            className="text-2xl tracking-wider text-white mb-1 transition-colors duration-300 group-hover:text-gold"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            {p.title}
          </h3>
          <p className="text-xs text-muted leading-relaxed mb-4" style={{ fontFamily: "Inter, sans-serif" }}>
            {p.desc}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {p.software.map((sw) => (
              <span
                key={sw}
                className="text-[9px] tracking-wider border border-gold/20 text-gold/60 px-2 py-0.5 rounded-full"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {sw}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom glow on hover */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          className="absolute bottom-0 inset-x-0 h-px bg-gold/40"
        />
      </motion.article>
    </SpotlightCard>
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

    const STREAMS: StreamDef[] = [
      { yFrac: 0.12, amplitude: 38, frequency: 1.4, speed: 0.00110, color: "200,169,110", count: 18 },
      { yFrac: 0.25, amplitude: 55, frequency: 1.1, speed: 0.00085, color: "255,255,255", count: 16 },
      { yFrac: 0.38, amplitude: 42, frequency: 1.7, speed: 0.00130, color: "180,100,50",  count: 17 },
      { yFrac: 0.50, amplitude: 60, frequency: 0.9, speed: 0.00070, color: "200,169,110", count: 20 },
      { yFrac: 0.62, amplitude: 35, frequency: 1.5, speed: 0.00100, color: "255,255,255", count: 15 },
      { yFrac: 0.74, amplitude: 50, frequency: 1.2, speed: 0.00095, color: "180,100,50",  count: 18 },
      { yFrac: 0.86, amplitude: 44, frequency: 1.6, speed: 0.00120, color: "200,169,110", count: 16 },
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

    let time = 0;
    let raf: number;

    const draw = () => {
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
        if (s.color === "200,169,110") {
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
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
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

export default function Projects() {
  const [active, setActive] = useState<Category>("ALL");
  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true });

  const filtered = active === "ALL" ? projects : projects.filter((p) => p.category === active);

  return (
    <section id="work" className="relative h-screen bg-[#080808] overflow-hidden flex flex-col">
      {/* Energy streams background */}
      <EnergyStreamsCanvas />
      {/* Dark overlay — keeps cards readable */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "rgba(8,8,8,0.90)", zIndex: 2 }}
      />

      {/* Section content — scrollable within the 100vh container */}
      <div className="relative flex-1 overflow-y-auto" style={{ zIndex: 10 }}>
        <div className="max-w-[1400px] mx-auto px-8 py-10">
          {/* Header */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="mb-6"
          >
            <p
              className="text-[10px] tracking-[0.5em] uppercase text-gold mb-1"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Portfolio
            </p>
            <h2
              className="text-[clamp(2.5rem,6vw,5rem)] leading-none text-white tracking-wide mb-8"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              SELECTED WORK
            </h2>

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className={`text-[9px] tracking-[0.3em] uppercase px-4 py-2.5 border transition-all duration-300 ${
                    active === cat
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-white/10 text-muted hover:border-gold/30 hover:text-white/60"
                  }`}
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Gold line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.9 }}
            className="origin-left h-px bg-gold/20 mb-10"
          />

          {/* Grid */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-8">
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4 }}
                >
                  {"vimeoId" in p && p.vimeoId ? (
                    <VimeoCard p={p as VimeoProject} i={i} />
                  ) : (
                    <ProjectCard p={p as PlaceholderProject} i={i} />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
