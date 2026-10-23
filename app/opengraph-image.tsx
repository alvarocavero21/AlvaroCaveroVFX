import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Alvaro VFX — Alvaro Cavero, FX Artist";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Link preview (LinkedIn, WhatsApp, email): mirrors the hero — gold title, name and role, software line
export default async function OpengraphImage() {
  const bebas = await readFile(join(process.cwd(), "app/fonts/BebasNeue-Regular.ttf"));
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(ellipse at 50% 45%, #1a1408 0%, #080808 65%)",
          color: "#c8a96e",
        }}
      >
        <div style={{ fontFamily: "Bebas Neue", fontSize: 190, letterSpacing: 24, lineHeight: 1 }}>ALVARO VFX</div>
        <div style={{ fontSize: 30, letterSpacing: 14, color: "#e8e4dc", marginTop: 18 }}>ALVARO CAVERO · FX ARTIST</div>
        <div style={{ width: 160, height: 2, background: "#c8a96e", opacity: 0.6, marginTop: 34 }} />
        <div style={{ fontSize: 24, letterSpacing: 6, color: "#8a8478", marginTop: 30 }}>
          Destruction · Pyro · FLIP Water — Houdini · Karma · Nuke
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Bebas Neue", data: bebas, style: "normal", weight: 400 }] },
  );
}
