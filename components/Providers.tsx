"use client";

import dynamic from "next/dynamic";
import { LazyMotion, domAnimation } from "framer-motion";
import { ThemeProvider } from "@/contexts/ThemeContext";

// ssr:false is allowed here because this is a Client Component
const CursorTrail  = dynamic(() => import("@/components/ui/cursor-trail"),  { ssr: false });
const CustomCursor = dynamic(() => import("@/components/CustomCursor"),       { ssr: false });

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LazyMotion features={domAnimation}>
        <CursorTrail />
        <CustomCursor />
        {children}
      </LazyMotion>
    </ThemeProvider>
  );
}
