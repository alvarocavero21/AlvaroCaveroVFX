"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

const POOL = "!<>-_\\/[]{}—=+*^?#@$%&ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const EASE = "cubic-bezier(0.23,1,0.32,1)";

// Map each letter to its position among non-space chars (spaces get -1)
function buildCharIdx(letters: string[]): number[] {
  let n = 0;
  return letters.map((c) => (c === " " ? -1 : n++));
}

// ─── SplitText ────────────────────────────────────────────────────────────────
// Pure slide-up reveal, no scramble. For hero elements.

export interface SplitTextProps {
  text: string;
  stagger?: number;         // seconds between chars (default 0.04)
  charDuration?: number;    // duration per char in seconds (default 0.6)
  delay?: number;           // ms before animation starts (default 0)
  triggerOnMount?: boolean; // true = fires on mount; false = IntersectionObserver
  className?: string;
  style?: CSSProperties;
}

export function SplitText({
  text,
  stagger = 0.04,
  charDuration = 0.6,
  delay = 0,
  triggerOnMount = false,
  className,
  style,
}: SplitTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const played = useRef(false);
  const [on, setOn] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const fire = () => {
      if (played.current) return;
      played.current = true;
      if (delay > 0) {
        timeout = setTimeout(() => setOn(true), delay);
      } else {
        setOn(true);
      }
    };

    if (triggerOnMount) {
      fire();
      return () => { if (timeout !== undefined) clearTimeout(timeout); };
    }

    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) fire(); },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      if (timeout !== undefined) clearTimeout(timeout);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const letters = [...text];
  const idx = buildCharIdx(letters);

  return (
    <span ref={ref} className={className} style={style} aria-label={text}>
      {letters.map((char, i) =>
        char === " " ? (
          <span key={i} style={{ display: "inline-block", width: "0.28em" }} />
        ) : (
          <span
            key={i}
            style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}
          >
            <span
              style={{
                display: "inline-block",
                transform: on ? "translateY(0) rotate(0deg)" : "translateY(110%) rotate(8deg)",
                opacity: on ? 1 : 0,
                transition: on
                  ? `transform ${charDuration}s ${EASE} ${idx[i] * stagger}s,` +
                    `opacity ${charDuration * 0.75}s ease ${idx[i] * stagger}s`
                  : "none",
              }}
            >
              {char}
            </span>
          </span>
        )
      )}
    </span>
  );
}

// ─── SplitScramble ────────────────────────────────────────────────────────────
// Phase 1: chars slide up (staggered).
// Phase 2: after all chars land, run text-scramble animation.
// Single IntersectionObserver, plays once.

type ScrambleChar = { char: string; resolved: boolean };
type Phase = "hidden" | "sliding" | "scrambling";

export interface SplitScrambleProps {
  text: string;
  stagger?: number;           // seconds between chars (default 0.05)
  charDuration?: number;      // slide-up duration in seconds (default 0.6)
  scrambleDuration?: number;  // total scramble time in ms (default 1200)
}

export function SplitScramble({
  text,
  stagger = 0.05,
  charDuration = 0.6,
  scrambleDuration = 1200,
}: SplitScrambleProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const played = useRef(false);
  const [phase, setPhase] = useState<Phase>("hidden");
  const [sChars, setSChars] = useState<ScrambleChar[]>(() =>
    [...text].map((c) => ({ char: c, resolved: true }))
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let slideTimeout: ReturnType<typeof setTimeout> | undefined;
    let raf: number | undefined;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || played.current) return;
        played.current = true;
        setPhase("sliding");

        const letters = [...text];
        const nonSpace = letters.filter((c) => c !== " ").length;
        // +80 ms buffer so the last char fully lands before scramble starts
        const slideMs = ((nonSpace - 1) * stagger + charDuration) * 1000 + 80;

        slideTimeout = setTimeout(() => {
          setPhase("scrambling");

          const total = letters.length;
          const start = performance.now();

          const tick = (now: number) => {
            const t = Math.min((now - start) / scrambleDuration, 1);
            const resolved = Math.floor((1 - (1 - t) ** 2) * total);

            setSChars(
              letters.map((c, i) => ({
                char:
                  c === " " || i < resolved
                    ? c
                    : POOL[Math.floor(Math.random() * POOL.length)],
                resolved: c === " " || i < resolved,
              }))
            );

            if (t < 1) {
              raf = requestAnimationFrame(tick);
            } else {
              setSChars(letters.map((c) => ({ char: c, resolved: true })));
            }
          };

          raf = requestAnimationFrame(tick);
        }, slideMs);
      },
      { threshold: 0.3 }
    );

    obs.observe(el);
    return () => {
      obs.disconnect();
      if (slideTimeout !== undefined) clearTimeout(slideTimeout);
      if (raf !== undefined) cancelAnimationFrame(raf);
    };
  }, [text, stagger, charDuration, scrambleDuration]);

  const letters = [...text];
  const idx = buildCharIdx(letters);

  // ── Phase 1: hidden / sliding ───────────────────────────────────────────────
  if (phase !== "scrambling") {
    const isSliding = phase === "sliding";
    return (
      <span ref={ref} aria-label={text}>
        {letters.map((char, i) =>
          char === " " ? (
            <span key={i} style={{ display: "inline-block", width: "0.28em" }} />
          ) : (
            <span
              key={i}
              style={{
                display: "inline-block",
                overflow: "hidden",
                verticalAlign: "bottom",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  transform: isSliding
                    ? "translateY(0) rotate(0deg)"
                    : "translateY(110%) rotate(8deg)",
                  opacity: isSliding ? 1 : 0,
                  transition: isSliding
                    ? `transform ${charDuration}s ${EASE} ${idx[i] * stagger}s,` +
                      `opacity ${charDuration * 0.75}s ease ${idx[i] * stagger}s`
                    : "none",
                }}
              >
                {char}
              </span>
            </span>
          )
        )}
      </span>
    );
  }

  // ── Phase 2: scrambling ─────────────────────────────────────────────────────
  return (
    <span ref={ref} aria-label={text}>
      {sChars.map(({ char, resolved }, i) => (
        <span
          key={i}
          style={{
            display: char === " " ? "inline" : "inline-block",
            color: resolved ? "inherit" : "#c8a96e",
            transition: resolved ? "color 0.08s ease" : undefined,
          }}
        >
          {char === " " ? " " : char}
        </span>
      ))}
    </span>
  );
}
