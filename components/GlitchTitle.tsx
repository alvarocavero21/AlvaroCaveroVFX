"use client";

import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function GlitchTitle({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const controls = useAnimation();
  const { ref, inView } = useInView({ threshold: 0.25, triggerOnce: true });

  useEffect(() => {
    if (!inView) return;
    controls.start({
      textShadow: [
        "0px 0px 0px transparent",
        "4px 0px 0px rgba(255,0,60,0.80), -4px 0px 0px rgba(0,130,255,0.80)",
        "-6px 0px 0px rgba(255,0,60,0.90), 6px 0px 0px rgba(0,130,255,0.90)",
        "3px 0px 0px rgba(255,0,60,0.65), -3px 0px 0px rgba(0,130,255,0.65)",
        "0px 0px 0px transparent",
        "-2px 0px 0px rgba(255,0,60,0.40), 2px 0px 0px rgba(0,130,255,0.40)",
        "0px 0px 0px transparent",
      ],
      x: [0, -4, 6, -2, 0, 2, 0],
      transition: {
        duration: 0.65,
        times: [0, 0.10, 0.25, 0.42, 0.60, 0.80, 1],
        ease: "easeOut",
      },
    });
  }, [inView, controls]);

  return (
    <motion.h2
      ref={ref}
      animate={controls}
      className={className}
      style={style}
    >
      {children}
    </motion.h2>
  );
}
