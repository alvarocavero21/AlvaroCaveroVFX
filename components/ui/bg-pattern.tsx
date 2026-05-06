"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

type Variant = "grid" | "dots" | "lines";
type Mask = "fade-edges" | "fade-top" | "fade-bottom" | "none";

interface BGPatternProps {
  variant?: Variant;
  mask?: Mask;
  size?: number;
  fill?: string;
  className?: string;
}

const MASK: Record<Mask, string> = {
  "fade-edges":
    "radial-gradient(ellipse at center, black 40%, transparent 80%)",
  "fade-top":
    "linear-gradient(to bottom, transparent, black 35%)",
  "fade-bottom":
    "linear-gradient(to top, transparent, black 35%)",
  none: "none",
};

export function BGPattern({
  variant = "grid",
  mask = "none",
  size = 32,
  fill = "rgba(255,255,255,0.1)",
  className,
}: BGPatternProps) {
  const id = useId();

  const pattern = () => {
    if (variant === "dots") {
      return <circle cx={size / 2} cy={size / 2} r={1} fill={fill} />;
    }
    if (variant === "lines") {
      return (
        <line
          x1={0} y1={size / 2}
          x2={size} y2={size / 2}
          stroke={fill} strokeWidth={1}
        />
      );
    }
    // grid
    return (
      <path
        d={`M ${size} 0 L 0 0 0 ${size}`}
        fill="none"
        stroke={fill}
        strokeWidth={1}
      />
    );
  };

  const maskValue = MASK[mask];

  return (
    <div
      aria-hidden
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={{
        maskImage: maskValue,
        WebkitMaskImage: maskValue,
      }}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={id}
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
          >
            {pattern()}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
    </div>
  );
}
