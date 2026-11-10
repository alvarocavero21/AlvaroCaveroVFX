import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import ThemeToggle from "@/components/ui/theme-toggle";

export const metadata: Metadata = {
  metadataBase: new URL("https://alvaro-cavero-vfx.vercel.app"),
  title: "ACJ Studios | Alvaro Cavero, VFX Artist",
  description:
    "Alvaro Cavero, VFX Artist based in Madrid. Specializing in photorealistic destruction, fire, water simulation and cinematic rendering for cinema and games. Houdini · Karma · Nuke · Unreal Engine.",
  keywords: ["VFX Artist", "Houdini", "Karma XPU", "Nuke", "Unreal Engine", "Pyro", "FLIP Fluids", "Destruction VFX"],
  authors: [{ name: "Alvaro Cavero" }],
  openGraph: {
    title: "ACJ Studios | Alvaro Cavero, VFX Artist",
    description: "Photorealistic FX for cinema and games: destruction, pyro and FLIP water in Houdini.",
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
        {/* ACJ STUDIOS intro v2 (once per visit, skippable, ~1.6 s): embers gather into the logo, which then flies
            onto the Hero logo while the black burns away. Plain blocking script on purpose: it has to hide the page
            before the first paint. Source: public/acj-intro/acj-intro.js */}
        <link rel="preload" as="image" href="/brand/logo_hero_oscuro.webp" />
        <link rel="stylesheet" href="/acj-intro/acj-intro.css" />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/acj-intro/acj-intro.js" />
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
