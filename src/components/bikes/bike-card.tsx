import Link from "next/link";
import { formatLei } from "@/lib/money";
import { bikeTitle } from "@/lib/bike-name";

type BikeCardData = {
  sku: string;
  brand: string | null;
  model: string | null;
  name: string | null;
  modelYear: string | null;
  frameSize: string | null;
  wheelSize: string | null;
  conditionGrade: "A" | "B" | "C";
  priceCents: number;
  oldPriceCents: number | null;
  status: string;
  photos: string[];
};

function assetUrl(key: string): string | null {
  const base = process.env.R2_PUBLIC_URL;
  return base ? `${base}/${key}` : null;
}

export function BikeCard({ bike }: { bike: BikeCardData }) {
  const photo = bike.photos[0] ? assetUrl(bike.photos[0]) : null;
  const title = bikeTitle(bike);
  return (
    <Link
      href={`/bikes/${bike.sku}`}
      className="group flex flex-col overflow-hidden rounded border border-border bg-card transition-colors hover:border-asphalt/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <div className="relative aspect-[3/4] bg-manila/40">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-sm text-asphalt/40">
            {bike.sku}
          </div>
        )}
        {bike.status === "reserved" ? (
          <span className="absolute left-3 top-3 rounded bg-asphalt/85 px-2 py-1 font-mono text-[0.65rem] uppercase tracking-wider text-paper">
            Rezervată
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="font-mono text-xs text-steel">{bike.sku}</span>
        <h3 className="mt-2 font-heading text-base font-semibold tracking-tight">{title}</h3>
        <p className="mt-1 font-mono text-xs text-steel">
          {[bike.modelYear, bike.frameSize, bike.wheelSize ? `${bike.wheelSize}"` : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-heading text-lg font-bold tracking-tight">{formatLei(bike.priceCents)}</span>
          {bike.oldPriceCents ? (
            <span className="font-mono text-xs text-steel line-through">{formatLei(bike.oldPriceCents)}</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
