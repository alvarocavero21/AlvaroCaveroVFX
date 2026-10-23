import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Favicon: gold "AV" monogram on the site's black, same Bebas Neue as the hero
export default async function Icon() {
  const bebas = await readFile(join(process.cwd(), "app/fonts/BebasNeue-Regular.ttf"));
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#080808",
          color: "#c8a96e",
          fontFamily: "Bebas Neue",
          fontSize: 46,
          letterSpacing: 1,
          paddingTop: 4,
        }}
      >
        AV
      </div>
    ),
    { ...size, fonts: [{ name: "Bebas Neue", data: bebas, style: "normal", weight: 400 }] },
  );
}
