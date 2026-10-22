"use client";

import dynamic from "next/dynamic";
import { LazyMotion, domAnimation } from "framer-motion";

const CustomCursor = dynamic(() => import("@/components/CustomCursor"), { ssr: false });

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      <CustomCursor />
      {children}
    </LazyMotion>
  );
}
