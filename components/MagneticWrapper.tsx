"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function MagneticWrapper({
  children,
  className,
  block = false,
}: {
  children: React.ReactNode;
  className?: string;
  block?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { damping: 12, stiffness: 180, mass: 0.2 });
  const sy = useSpring(y, { damping: 12, stiffness: 180, mass: 0.2 });

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.26);
    y.set((e.clientY - cy) * 0.26);
  };

  return (
    <div
      ref={ref}
      className={`${block ? "block" : "inline-block"} p-8 -m-8 ${className ?? ""}`}
      onMouseMove={handleMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
    >
      <motion.div style={{ x: sx, y: sy }}>
        {children}
      </motion.div>
    </div>
  );
}
