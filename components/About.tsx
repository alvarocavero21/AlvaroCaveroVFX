"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

// ── Hyperrealistic ocean wave simulation ─────────────────────────────────────

function WaterCanvas() {
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

    // ── 8 wave layers: deep/slow → shallow/faster ────────────────────────────
    // Speed unit: scrolls canvas-width per (1/speed) frames → full cycle ~30-45 s
    const LAYERS = [
      { yFrac:0.92, amp:80, freq:0.0030, speed:0.000030, phase:0.00, hex:"#000d1a", alpha:1.00 },
      { yFrac:0.78, amp:65, freq:0.0038, speed:0.000038, phase:1.26, hex:"#001833", alpha:0.96 },
      { yFrac:0.65, amp:52, freq:0.0047, speed:0.000047, phase:2.51, hex:"#001e3d", alpha:0.90 },
      { yFrac:0.53, amp:42, freq:0.0055, speed:0.000057, phase:0.83, hex:"#003355", alpha:0.84 },
      { yFrac:0.42, amp:32, freq:0.0063, speed:0.000066, phase:3.14, hex:"#004d7a", alpha:0.75 },
      { yFrac:0.32, amp:24, freq:0.0072, speed:0.000076, phase:1.88, hex:"#0077aa", alpha:0.62 },
      { yFrac:0.23, amp:18, freq:0.0080, speed:0.000085, phase:4.19, hex:"#0088cc", alpha:0.46 },
      { yFrac:0.15, amp:12, freq:0.0088, speed:0.000093, phase:0.52, hex:"#009999", alpha:0.28 },
    ];

    // ── Foam dots that bob on wave crests ────────────────────────────────────
    type FoamDot = { li:number; xFrac:number; bobPhase:number; bobAmp:number; alpha:number };
    const foam: FoamDot[] = LAYERS.flatMap((_, li) =>
      Array.from({ length: 4 }, () => ({
        li,
        xFrac:    Math.random(),
        bobPhase: Math.random() * Math.PI * 2,
        bobAmp:   3 + Math.random() * 5,
        alpha:    0.15 + Math.random() * 0.25,
      }))
    );

    // Compute wave surface Y at a given pixel X
    const wY = (L: typeof LAYERS[0], x: number, offset: number, H: number) =>
      L.yFrac * H +
      Math.sin(x * L.freq + offset)                              * L.amp +
      Math.sin(x * L.freq * 1.618 + offset * 0.71 + L.phase)    * L.amp * 0.38 +
      Math.sin(x * L.freq * 2.718 - offset * 0.47 + L.phase*1.3)* L.amp * 0.18 +
      Math.sin(x * L.freq * 0.41  + offset * 0.32 + L.phase*0.5)* L.amp * 0.28;

    let t = 0, raf: number;

    const draw = () => {
      t++;
      const W = canvas.width, H = canvas.height;

      // Deep ocean base
      ctx.fillStyle = "#000510";
      ctx.fillRect(0, 0, W, H);

      // ── Draw layers back → front ──────────────────────────────────────────
      for (const L of LAYERS) {
        const offset = t * L.speed * W;

        // Filled wave polygon (wave crest → canvas bottom)
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 3) ctx.lineTo(x, wY(L, x, offset, H));
        ctx.lineTo(W, H);
        ctx.closePath();

        const baseY = L.yFrac * H;
        const grad = ctx.createLinearGradient(0, baseY - L.amp * 2.5, 0, H);
        grad.addColorStop(0,   L.hex + "bb");
        grad.addColorStop(0.4, L.hex + "ee");
        grad.addColorStop(1,   L.hex + "ff");
        ctx.fillStyle  = grad;
        ctx.globalAlpha = L.alpha;
        ctx.fill();

        // Subsurface teal scatter glow in troughs
        const teal = ctx.createLinearGradient(0, baseY, 0, baseY + L.amp * 2);
        teal.addColorStop(0, "rgba(0,255,200,0.05)");
        teal.addColorStop(1, "rgba(0,255,200,0)");
        ctx.fillStyle  = teal;
        ctx.globalAlpha = L.alpha * 0.6;
        ctx.fill();

        // Foam / white-cap crest line
        ctx.beginPath();
        for (let x = 0; x <= W; x += 3) {
          const y = wY(L, x, offset, H);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle  = "rgba(150,200,255,0.28)";
        ctx.lineWidth    = 1.5;
        ctx.globalAlpha  = L.alpha * 0.7;
        ctx.stroke();
      }

      // ── Bobbing foam dots ─────────────────────────────────────────────────
      for (const d of foam) {
        const L      = LAYERS[d.li];
        const offset = t * L.speed * canvas.width;
        const px     = d.xFrac * canvas.width;
        const py     = wY(L, px, offset, H) + Math.sin(t * 0.012 + d.bobPhase) * d.bobAmp;
        ctx.globalAlpha = d.alpha;
        ctx.fillStyle   = "rgba(200,230,255,0.9)";
        ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill();
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ filter: "blur(8px)", zIndex: 0 }}
    />
  );
}

function WordReveal({
  text,
  baseDelay = 0,
  className,
}: {
  text: string;
  baseDelay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  return (
    <span ref={ref} className={className}>
      {text.split(" ").map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.38, delay: baseDelay + i * 0.038, ease: "easeOut" }}
          className="inline-block"
          style={{ marginRight: "0.32em" }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

const tags = [
  "Pyro", "FLIP Fluids", "Vellum", "RBD Destruction",
  "Karma XPU", "USD / Solaris", "Nuke Compositing",
  "ComfyUI AI", "MaterialX", "VEX", "OpenVDB", "Arnold",
];

export default function About() {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true });

  return (
    <section id="about" className="relative h-screen overflow-hidden bg-[#060606] flex flex-col justify-center">
      {/* Water particle background */}
      <WaterCanvas />
      {/* Dark overlay — above canvas (z-0) */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(6,6,6,0.55)", zIndex: 1 }} />
      {/* Grain texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
          zIndex: 2,
        }}
      />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" style={{ zIndex: 2 }} />

      {/* Section content sits above all canvas layers */}
      <div className="relative max-w-[1400px] mx-auto px-8" style={{ zIndex: 10 }}>
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left — large number */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative select-none">
              <div
                className="text-[clamp(10rem,20vw,18rem)] leading-none font-bebas tracking-tight opacity-[0.04] text-white absolute inset-0 flex items-center justify-center"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                02
              </div>
              <div className="relative text-center px-10 py-14">
                {/* Circle decoration */}
                <div className="w-56 h-56 rounded-full border border-gold/20 flex items-center justify-center mx-auto mb-6">
                  <div className="w-40 h-40 rounded-full border border-gold/10 flex items-center justify-center">
                    <div className="text-center">
                      <div
                        className="text-6xl text-gold leading-none"
                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                      >
                        02
                      </div>
                      <div
                        className="text-[9px] tracking-[0.4em] uppercase text-muted mt-1"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        Years
                      </div>
                    </div>
                  </div>
                </div>
                <p
                  className="text-xs tracking-[0.4em] uppercase text-gold/60"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Full-Time Houdini
                </p>
              </div>
            </div>
          </div>

          {/* Right — text content */}
          <div ref={ref}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              <p
                className="text-[10px] tracking-[0.5em] uppercase text-gold mb-2"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                About
              </p>
              <h2
                className="text-[clamp(3rem,7vw,5.5rem)] leading-none text-white tracking-wide mb-2"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                THE ARTIST
              </h2>
              <div className="w-12 h-px bg-gold mb-8" />

              <div
                className="space-y-5 text-[#555] text-sm leading-[1.9] mb-10"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                <p>
                  <WordReveal
                    text="VFX Artist based in Madrid, Spain."
                    baseDelay={0}
                    className="text-white font-medium"
                  />
                  {" "}
                  <WordReveal
                    text="Specialized in photorealistic destruction, fire, water simulation and cinematic rendering for cinema and video games."
                    baseDelay={0.18}
                  />
                </p>
                <p>
                  <WordReveal
                    text="Two years full-time Houdini — working in SOPs for geometry, then staging in LOPs with Karma XPU for final renders. I push photorealism further using AI post-processing through ComfyUI with ControlNet depth and normal passes."
                    baseDelay={0}
                  />
                </p>
                <p>
                  <WordReveal
                    text="Currently available for freelance projects, studio collaborations and full-time positions across Europe."
                    baseDelay={0}
                  />
                </p>
              </div>
            </motion.div>

            {/* Horizontal scrolling tags */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <p
                className="text-[9px] tracking-[0.4em] uppercase text-muted mb-4"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Specializations
              </p>
              <div className="tags-scroll overflow-x-auto pb-2">
                <div className="flex gap-2 w-max">
                  {tags.map((tag, i) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, x: 20 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.4 + i * 0.05 }}
                      className="shrink-0 text-[10px] tracking-wider border border-gold/25 text-gold/70 px-3 py-1.5 whitespace-nowrap hover:border-gold/50 hover:text-gold transition-all duration-300"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
    </section>
  );
}
