"use client";

import dynamic from "next/dynamic";
import { LazyMotion, domAnimation } from "framer-motion";
import { ThemeProvider } from "@/contexts/ThemeContext";

const CustomCursor = dynamic(() => import("@/components/CustomCursor"), { ssr: false });

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LazyMotion features={domAnimation}>
        <CustomCursor />
        {children}
      </LazyMotion>
    </ThemeProvider>
  );
}
