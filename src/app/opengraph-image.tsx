import { ImageResponse } from "next/og";

// Site-wide social share card, used for the home page and any page without its
// own opengraph-image. Text is kept diacritic-safe so the built-in font never
// renders missing glyphs.
export const alt = "Second Cycle: biciclete second-hand reparate si garantate";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#15181B",
          color: "#EDEFEA",
          padding: "76px 84px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#8A938C",
          }}
        >
          Biciclete second-hand
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 108, fontWeight: 800, lineHeight: 1 }}>
            Second Cycle
          </div>
          <div style={{ display: "flex", fontSize: 42, marginTop: 22, color: "#C9CDC8" }}>
            Reparate • Verificate • Cu acte
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", height: 16, width: 16, borderRadius: 99, background: "#0C4DA2" }} />
          <div style={{ display: "flex", fontSize: 30, color: "#C9CDC8" }}>www.secondcycle.ro</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
