"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function LineDraw({
  className,
  color = "rgba(200,169,110,0.25)",
  duration = 1.0,
}: {
  className?: string;
  color?: string;
  duration?: number;
}) {
  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true });

  return (
    <div ref={ref} className={`w-full overflow-hidden ${className ?? ""}`}>
      <svg height="1" width="100%" style={{ display: "block" }}>
        <motion.line
          x1="0" y1="0.5" x2="100%" y2="0.5"
          stroke={color}
          strokeWidth="1"
          strokeLinecap="square"
          pathLength="1"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
}
