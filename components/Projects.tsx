"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player/youtube"), { ssr: false });

const CATEGORIES = ["ALL", "PYRO & FIRE", "WATER & FLUIDS", "DESTRUCTION", "CHARACTER FX", "ENVIRONMENTS"] as const;
type Category = (typeof CATEGORIES)[number];

const projects = [
  {
    id: 1,
    title: "FIRE SCENE 01",
    category: "PYRO & FIRE" as Category,
    software: ["Houdini", "Karma", "ComfyUI"],
    videoUrl: "https://www.youtube.com/watch?v=BkbtGdCxg2E",
    thumb: "https://img.youtube.com/vi/BkbtGdCxg2E/maxresdefault.jpg",
    desc: "Burning car simulation with secondary pyro, embers and heat distortion.",
    year: "2024",
  },
  {
    id: 2,
    title: "DRAGON BATTLE",
    category: "CHARACTER FX" as Category,
    software: ["Houdini", "Karma"],
    videoUrl: "https://www.youtube.com/watch?v=23VkGD-4uwk",
    thumb: "https://img.youtube.com/vi/23VkGD-4uwk/maxresdefault.jpg",
    desc: "Full creature FX pipeline with procedural scales, fire breath and cloth simulation.",
    year: "2024",
  },
  {
    id: 3,
    title: "HELICOPTER ISLAND",
    category: "ENVIRONMENTS" as Category,
    software: ["Houdini", "Karma", "ComfyUI"],
    videoUrl: "https://www.youtube.com/watch?v=RotNWltS9a8",
    thumb: "https://img.youtube.com/vi/RotNWltS9a8/maxresdefault.jpg",
    desc: "Large-scale procedural island environment with atmospheric FX and rotor wash.",
    year: "2024",
  },
  {
    id: 4,
    title: "WATERFALL",
    category: "WATER & FLUIDS" as Category,
    software: ["Houdini", "FLIP", "Karma"],
    videoUrl: "https://www.youtube.com/watch?v=22jZR6x_tTo",
    thumb: "https://img.youtube.com/vi/22jZR6x_tTo/maxresdefault.jpg",
    desc: "FLIP fluid waterfall with whitewater, foam and mist volumes rendered with Karma XPU.",
    year: "2024",
  },
  {
    id: 5,
    title: "DESTRUCTION RIG",
    category: "DESTRUCTION" as Category,
    software: ["Houdini", "RBD", "Karma"],
    videoUrl: "https://www.youtube.com/watch?v=BkbtGdCxg2E",
    thumb: "https://img.youtube.com/vi/BkbtGdCxg2E/maxresdefault.jpg",
    desc: "Procedural constraint network for photorealistic building demolition.",
    year: "2024",
  },
  {
    id: 6,
    title: "BURNING CLOTH",
    category: "CHARACTER FX" as Category,
    software: ["Houdini", "Vellum", "Karma"],
    videoUrl: "https://www.youtube.com/watch?v=22jZR6x_tTo",
    thumb: "https://img.youtube.com/vi/22jZR6x_tTo/maxresdefault.jpg",
    desc: "Vellum cloth destruction with integrated pyro for burning fabric simulation.",
    year: "2025",
  },
];

function ProjectCard({ p, i }: { p: (typeof projects)[0]; i: number }) {
  const [hovered, setHovered] = useState(false);
  const [modal, setModal] = useState(false);
  const { ref, inView } = useInView({ threshold: 0.08, triggerOnce: true });

  return (
    <>
      <motion.article
        ref={ref}
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
        transition={{ duration: 0.65, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="group relative overflow-hidden bg-[#111111] border border-white/[0.06] hover:border-gold/30 transition-all duration-500 cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setModal(true)}
        data-cursor
      >
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <motion.div
            animate={{ scale: hovered ? 1.06 : 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${p.thumb})` }}
          />
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{ background: hovered ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.5)" }}
          />

          {/* Play icon */}
          <motion.div
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-12 h-12 rounded-full border border-gold/60 flex items-center justify-center bg-black/30">
              <svg className="w-4 h-4 text-gold fill-current ml-0.5" viewBox="0 0 12 12">
                <polygon points="2,1 11,6 2,11" />
              </svg>
            </div>
          </motion.div>

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
            <span
              className="text-[9px] tracking-widest text-white/40"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {p.year}
            </span>
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
          <p
            className="text-xs text-muted leading-relaxed mb-4"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
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

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 bg-black/92 backdrop-blur-lg"
            onClick={() => setModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4 px-1">
                <div>
                  <h3
                    className="text-4xl tracking-wider text-white"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    {p.title}
                  </h3>
                  <p
                    className="text-xs text-gold/70 tracking-widest uppercase mt-0.5"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {p.software.join(" · ")}
                  </p>
                </div>
                <button
                  onClick={() => setModal(false)}
                  className="text-muted hover:text-white transition-colors p-2 mt-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="aspect-video bg-black border border-white/10">
                <ReactPlayer
                  url={p.videoUrl}
                  playing
                  controls
                  width="100%"
                  height="100%"
                  config={{ playerVars: { modestbranding: 1, rel: 0 } }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Energy Streams particle background ───────────────────────────────────────

type StreamDef = {
  yFrac:     number;   // base Y as fraction of canvas height
  amplitude: number;   // wave amplitude in px
  frequency: number;   // wave cycles across full canvas width
  speed:     number;   // how fast particles advance (fraction of canvas width per frame)
  color:     string;
  count:     number;   // particles in this stream
};

type StreamParticle = {
  streamIdx: number;
  t:         number;   // 0..1 position along stream (wraps)
  size:      number;
  brightness: number;  // 0..1 — used to pick which part of the stream this particle "is"
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

    // Per-stream phase offsets so they all start at different wave positions
    const phaseOffsets = STREAMS.map(() => rand(0, Math.PI * 2));

    // Particles spread evenly across each stream
    const particles: StreamParticle[] = STREAMS.flatMap((s, si) =>
      Array.from({ length: s.count }, (_, pi) => ({
        streamIdx: si,
        t: pi / s.count,
        size: rand(2, 4),
        brightness: Math.random(),
      }))
    );

    // Returns canvas (x, y) for a particle at position t in stream si
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

      // Advance each particle along its stream
      for (const p of particles) {
        const s = STREAMS[p.streamIdx];
        p.t += s.speed;
        if (p.t > 1) p.t -= 1;
      }

      // Draw particles
      for (const p of particles) {
        const s = STREAMS[p.streamIdx];
        const [x, y] = streamPos(p.streamIdx, p.t, time);

        // Head of stream (t near 0 after wrap) = bright; tail = dim
        // Use a smooth sinusoidal brightness so no hard cutoff
        const headness = Math.sin(p.t * Math.PI);  // 0→1→0
        const baseAlpha = 0.25 + headness * 0.60;

        // Base color alpha
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
                <ProjectCard p={p} i={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
      </div>
    </section>
  );
}
