import { ImageResponse } from "next/og";
import { db } from "@/server/db/client";
import { getPublicBikeBySku } from "@/server/services/bikes";
import { formatLei } from "@/lib/money";
import { bikeTitle } from "@/lib/bike-name";

export const runtime = "nodejs"; // reads the DB (pg) + fetches the R2 photo
export const alt = "Bicicleta second-hand la Second Cycle";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function assetUrl(key: string): string | null {
  const base = process.env.R2_PUBLIC_URL;
  return base ? `${base}/${key}` : null;
}

const STATUS: Record<string, string> = {
  available: "Disponibila",
  reserved: "Rezervata",
  sold: "Vanduta",
};

export default async function Image({ params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;
  const bike = await getPublicBikeBySku(db, sku);

  // Fallback to the branded card if the bike is missing.
  if (!bike) {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#15181B",
            color: "#EDEFEA",
            fontFamily: "sans-serif",
            fontSize: 96,
            fontWeight: 800,
          }}
        >
          Second Cycle
        </div>
      ),
      { ...size }
    );
  }

  const photo = bike.photos[0] ? assetUrl(bike.photos[0]) : null;
  const specLine = [
    bike.frameSize,
    bike.wheelSize ? `${bike.wheelSize}"` : null,
    bike.modelYear ? String(bike.modelYear) : null,
  ]
    .filter(Boolean)
    .join("  •  ");

  return new ImageResponse(
    (
      <div style={{ height: "100%", width: "100%", display: "flex", background: "#15181B", fontFamily: "sans-serif" }}>
        {photo ? (
          <div style={{ display: "flex", width: "56%", height: "100%" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="" width={672} height={630} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: photo ? "44%" : "100%",
            padding: "60px 54px",
            color: "#EDEFEA",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 5,
              textTransform: "uppercase",
              color: "#8A938C",
            }}
          >
            Second Cycle
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 54, fontWeight: 800, lineHeight: 1.05 }}>
              {bikeTitle(bike)}
            </div>
            {specLine ? (
              <div style={{ display: "flex", fontSize: 28, marginTop: 16, color: "#C9CDC8" }}>{specLine}</div>
            ) : null}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", fontSize: 46, fontWeight: 800 }}>{formatLei(bike.priceCents)}</div>
            <div
              style={{
                display: "flex",
                fontSize: 22,
                padding: "8px 16px",
                borderRadius: 99,
                background: "#0C4DA2",
                color: "#fff",
              }}
            >
              {STATUS[bike.status] ?? ""}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
