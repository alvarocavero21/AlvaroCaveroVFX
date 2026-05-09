"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";

const POOL = "!<>-_\\/[]{}—=+*^?#@$%&ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

type ScrambleChar = { char: string; resolved: boolean };

export function useTextScramble(
  text: string,
  duration = 1200
) {
  const ref = useRef<HTMLSpanElement>(null);
  const played = useRef(false);
  const [chars, setChars] = useState<ScrambleChar[]>(() =>
    [...text].map((c) => ({ char: c, resolved: true }))
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || played.current) return;
        played.current = true;

        const letters = [...text];
        const total = letters.length;
        const start = performance.now();
        let raf: number;

        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          const resolved = Math.floor((1 - (1 - t) ** 2) * total);

          setChars(
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
            setChars(letters.map((c) => ({ char: c, resolved: true })));
          }
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
      },
      { threshold: 0.3 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [text, duration]);

  return { ref, chars };
}

interface TextScrambleProps {
  text: string;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}

export function TextScramble({
  text,
  duration = 1200,
  className,
  style,
}: TextScrambleProps) {
  const { ref, chars } = useTextScramble(text, duration);

  return (
    <span ref={ref} className={className} style={style} aria-label={text}>
      {chars.map(({ char, resolved }, i) => (
        <span
          key={i}
          style={{
            color: resolved ? "inherit" : "#c8a96e",
            display: char === " " ? "inline" : "inline-block",
            transition: resolved ? "color 0.08s ease" : undefined,
          }}
        >
          {char === " " ? " " : char}
        </span>
      ))}
    </span>
  );
}
