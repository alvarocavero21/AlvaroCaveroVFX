"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { BGPattern } from "@/components/ui/bg-pattern";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { SplitScramble } from "@/components/ui/split-text";

// Demo Reel 2026 v2 (2026-11-23): "Alvaro Cavero – VFX Demo Reel 2026" — dragon, fighter jet, tank, tiger,
// rollover, river (before: b49EUAbJTvQ). null shows the "coming soon" panel.
const SHOWREEL_ID: string | null = "9GaHtmdz0mo";
// height of YouTube's control bar, left uncovered so seek / volume / fullscreen keep working
const CONTROLS_PX = 56;
const FPS = 30;

export default function Showreel() {
  const { ref, inView } = useInView({ threshold: 0.25, triggerOnce: false });
  const [timecode, setTimecode] = useState("00:00:00");
  const startRef    = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const iframeRef   = useRef<HTMLIFrameElement>(null);
  const playingRef  = useRef(false);

  // The overlay over the video keeps capturing wheel events (snap-scroll). Before, it let clicks through only for
  // 700 ms after a mousedown, so it took TWO clicks to play. Now a single click on it plays / pauses the video
  // through the YouTube iframe API (enablejsapi=1 + postMessage); the player's state comes back by postMessage too,
  // so it stays in sync if the YouTube controls are used.
  const ytCommand = (func: "playVideo" | "pauseVideo") => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: [] }), "*");
  };
  const togglePlay = () => {
    ytCommand(playingRef.current ? "pauseVideo" : "playVideo");
    playingRef.current = !playingRef.current;
  };
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (typeof e.origin !== "string" || !e.origin.includes("youtube")) return;
      let data: { event?: string; info?: unknown };
      try {
        data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      if (data?.event === "onStateChange" && typeof data.info === "number") {
        playingRef.current = data.info === 1 || data.info === 3; // playing / buffering
      } else if (data?.event === "infoDelivery" && data.info && typeof data.info === "object") {
        const st = (data.info as { playerState?: number }).playerState;
        if (typeof st === "number") playingRef.current = st === 1 || st === 3;
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);
  const startListening = () => {
    // ask the player to report its state changes to this page (repeated: the player may not be ready at onLoad)
    const ping = () =>
      iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: "showreel", channel: "widget" }), "*");
    ping();
    setTimeout(ping, 800);
    setTimeout(ping, 2000);
  };

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
      <BGPattern variant="grid" mask="fade-edges" size={32} fill="rgba(90, 202, 134, 0.15)" />

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

          <SpotlightCard glowColor="green" customSize className="w-full h-full">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.15 }}
              className="relative h-full bg-black overflow-hidden"
              style={{ boxShadow: "0 40px 120px rgba(0,0,0,0.8)" }}
            >
              {SHOWREEL_ID ? (
                <>
                  {/* Overlay: captures wheel events for snap-scroll and turns ONE click into play / pause.
                      The bottom strip (YouTube's control bar) is left uncovered. */}
                  <div
                    className="absolute inset-x-0 top-0"
                    role="button"
                    aria-label="Play / pause showreel"
                    onClick={togglePlay}
                    style={{ zIndex: 10, bottom: CONTROLS_PX, background: "transparent", cursor: "pointer" }}
                  />
                  <iframe
                    ref={iframeRef}
                    onLoad={startListening}
                    src={`https://www.youtube.com/embed/${SHOWREEL_ID}?autoplay=0&controls=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
                    title="Showreel"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                    style={{ border: "none" }}
                  />
                </>
              ) : (
                /* Coming soon: no video yet */
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse 70% 55% at 50% 60%, rgba(var(--accent-rgb),0.10), transparent 70%)" }}
                  />
                  <p
                    className="relative flex items-center gap-2 text-[10px] tracking-[0.5em] uppercase text-gold mb-4"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                    In production
                  </p>
                  <h3
                    className="relative text-white leading-none"
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "clamp(3rem, 9vw, 8rem)",
                      letterSpacing: "0.12em",
                    }}
                  >
                    <SplitScramble text="COMING SOON" stagger={0.05} />
                  </h3>
                  <p className="relative mt-4 text-xs md:text-sm text-muted tracking-[0.25em] uppercase" style={{ fontFamily: "Inter, sans-serif" }}>
                    New demo reel · 2026
                  </p>
                </div>
              )}
            </motion.div>
          </SpotlightCard>
        </div>

        {/* Frame counter */}
        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-[9px] tracking-[0.25em] text-gold/30" style={{ fontFamily: "'Courier New', monospace" }}>
            [{timecode}]
          </span>
          <span className="text-[9px] tracking-[0.25em] text-gold/20" style={{ fontFamily: "'Courier New', monospace" }}>
            30FPS · 4K
          </span>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </section>
  );
}
