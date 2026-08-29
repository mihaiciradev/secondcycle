import { db } from "@/server/db/client";
import { listPublicBikes } from "@/server/services/bikes";
import type { HomeBike } from "@/lib/content/home";
import { HomeClient } from "./home-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function assetUrl(key: string): string | null {
  const base = process.env.R2_PUBLIC_URL;
  return base ? `${base}/${key}` : null;
}

const SYMBOL: Record<string, HomeBike["symbol"]> = {
  mtb: "bike-mtb",
  road: "bike-road",
};
const CATEGORY: Record<string, HomeBike["category"]> = {
  mtb: "mountain",
  road: "road",
};

export default async function HomePage() {
  const { items } = await listPublicBikes(db, { limit: 6 });

  const bikes: HomeBike[] = items.map((b) => ({
    sku: b.sku,
    title: `${b.brand} ${b.model}`,
    symbol: SYMBOL[b.category] ?? "bike-city",
    category: CATEGORY[b.category] ?? "city",
    year: b.modelYear ?? null,
    frame: b.frameSize,
    wheel: b.wheelSize.replace(/"$/, ""),
    price: Math.round(b.priceCents / 100),
    work: b.workDone ?? [],
    photo: b.photos[0] ? assetUrl(b.photos[0]) : null,
    reserved: b.status === "reserved",
  }));

  return <HomeClient bikes={bikes} />;
}
