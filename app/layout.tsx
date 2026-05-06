import type { Metadata } from "next";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";

export const metadata: Metadata = {
  title: "Alvaro Cavero | VFX Artist",
  description:
    "VFX Artist based in Madrid. Specializing in photorealistic destruction, fire, water simulation and cinematic rendering for cinema and games. Houdini · Karma · Nuke · Unreal Engine.",
  keywords: ["VFX Artist", "Houdini", "Karma XPU", "Nuke", "Unreal Engine", "Pyro", "FLIP Fluids", "Destruction VFX"],
  authors: [{ name: "Alvaro Cavero" }],
  openGraph: {
    title: "Alvaro Cavero | VFX Artist",
    description: "Photorealistic VFX for cinema and games.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="grain bg-bg">
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
