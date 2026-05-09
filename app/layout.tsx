import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import ThemeToggle from "@/components/ui/theme-toggle";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Non-blocking font load: <link> beats CSS @import for render-blocking */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
        />
      </head>
      <body className="grain bg-bg">
        <Providers>
          {/* Theme toggle — top-right, same height as Navbar */}
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 24,
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              height: 74,
            }}
          >
            <ThemeToggle />
          </div>
          {children}
        </Providers>
      </body>
    </html>
  );
}
