"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player/youtube"), { ssr: false });

export default function Showreel() {
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const { ref, inView } = useInView({ threshold: 0.25, triggerOnce: false });

  return (
    <section id="showreel" ref={ref} className="relative bg-[#080808] h-screen overflow-hidden flex flex-col justify-center">
      {/* Top border line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="max-w-[1400px] mx-auto px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <p
              className="text-[10px] tracking-[0.5em] uppercase text-gold mb-1"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Demo Reel
            </p>
            <h2
              className="text-[clamp(2.5rem,6vw,5rem)] leading-none text-white tracking-wide"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              SHOWREEL 2025
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
          className="origin-left h-px bg-gold/40 mb-8"
        />

        {/* Player */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="relative aspect-video bg-black overflow-hidden"
          style={{ boxShadow: "0 40px 120px rgba(0,0,0,0.8)" }}
        >
          <ReactPlayer
            url="https://www.youtube.com/watch?v=BkbtGdCxg2E"
            playing={playing}
            muted
            loop
            width="100%"
            height="100%"
            controls={started}
            onPlay={() => { setStarted(true); setPlaying(true); }}
            onPause={() => setPlaying(false)}
            config={{ playerVars: { modestbranding: 1, rel: 0, showinfo: 0 } }}
          />

          {/* Play overlay */}
          {!started && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center group">
              <div
                style={{
                  backgroundImage: "url(https://img.youtube.com/vi/BkbtGdCxg2E/maxresdefault.jpg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                className="absolute inset-0 opacity-20"
              />
              <button
                onClick={() => { setStarted(true); setPlaying(true); }}
                className="relative z-10 flex items-center gap-4 group"
                aria-label="Play showreel"
              >
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  className="w-20 h-20 rounded-full border border-gold/60 flex items-center justify-center bg-black/30 backdrop-blur-sm hover:border-gold hover:bg-gold/10 transition-all duration-300"
                >
                  <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <svg className="w-7 h-7 text-gold fill-current ml-1" viewBox="0 0 12 12">
                      <polygon points="2,1 11,6 2,11" />
                    </svg>
                  </motion.div>
                </motion.div>
              </button>
              <p
                className="relative z-10 mt-5 text-[10px] tracking-[0.4em] uppercase text-muted"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Play Showreel
              </p>
            </div>
          )}
        </motion.div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </section>
  );
}
