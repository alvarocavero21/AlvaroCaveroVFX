"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

const SECTIONS = [
  { id: "showreel", num: "01" },
  { id: "work",     num: "02" },
  { id: "about",    num: "03" },
  { id: "contact",  num: "04" },
];

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SECTIONS.forEach((s, i) => {
      const el = document.getElementById(s.id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(i); },
        { threshold: 0.25 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  return (
    <>
      {/* Gold progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-[99998] h-[2px] origin-left pointer-events-none"
        style={{ scaleX, backgroundColor: "#c8a96e" }}
      />

      {/* Section counter — right side */}
      <nav className="fixed right-5 top-1/2 -translate-y-1/2 z-[99997] hidden md:flex flex-col gap-4 items-end">
        {SECTIONS.map((s, i) => (
          <a key={s.id} href={`#${s.id}`} className="group flex items-center gap-2">
            <motion.div
              animate={{ width: i === active ? 20 : 6, opacity: i === active ? 1 : 0.3 }}
              transition={{ duration: 0.35 }}
              style={{ height: 1, backgroundColor: "#c8a96e", display: "block" }}
            />
            <motion.span
              animate={{ color: i === active ? "#c8a96e" : "rgba(255,255,255,0.22)" }}
              transition={{ duration: 0.35 }}
              className="text-[9px] tracking-[0.3em] tabular-nums select-none"
              style={{ fontFamily: "Inter, monospace" }}
            >
              {s.num}
            </motion.span>
          </a>
        ))}
      </nav>
    </>
  );
}
