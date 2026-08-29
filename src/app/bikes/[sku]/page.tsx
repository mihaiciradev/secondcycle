import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/server/db/client";
import { getPublicBikeBySku } from "@/server/services/bikes";
import { getPaymentsLive } from "@/server/services/settings";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { BikeActions } from "@/components/bikes/bike-actions";
import { formatLei } from "@/lib/money";
import { WARRANTY_MONTHS } from "@/server/constants/app";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sku: string }>;
}): Promise<Metadata> {
  const { sku } = await params;
  const bike = await getPublicBikeBySku(db, sku);
  if (!bike) return { title: "Bicicletă negăsită" };
  return { title: `${bike.brand} ${bike.model} · ${bike.sku}` };
}

function assetUrl(key: string): string | null {
  const base = process.env.R2_PUBLIC_URL;
  return base ? `${base}/${key}` : null;
}

export default async function BikeDetailPage({ params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;
  const bike = await getPublicBikeBySku(db, sku);
  if (!bike) notFound();

  const [session, paymentsLive] = await Promise.all([auth(), getPaymentsLive(db)]);
  const photo = bike.photos[0] ? assetUrl(bike.photos[0]) : null;
  const specs: [string, string][] = [
    ["Serial", bike.sku],
    ["Marcă", bike.brand],
    ["Model", bike.model],
    ...(bike.modelYear ? ([["An", String(bike.modelYear)]] as [string, string][]) : []),
    ["Mărime cadru", bike.frameSize],
    ["Roți", `${bike.wheelSize}"`],
  ];

  return (
    <>
      <SiteHeader />
      <main id="continut" className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          <Link href="/bikes" className="font-mono text-xs uppercase tracking-wider text-steel hover:text-foreground">
            ← Toate bicicletele
          </Link>

          <div className="mt-6 grid gap-10 lg:grid-cols-2">
            <div className="overflow-hidden rounded border border-border bg-manila/40">
              <div className="aspect-[4/3]">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt={`${bike.brand} ${bike.model}`} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center font-mono text-lg text-asphalt/40">
                    {bike.sku}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {bike.brand} {bike.model}
              </h1>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="font-heading text-2xl font-bold tracking-tight">{formatLei(bike.priceCents)}</span>
                {bike.oldPriceCents ? (
                  <span className="font-mono text-sm text-steel line-through">{formatLei(bike.oldPriceCents)}</span>
                ) : null}
              </div>

              {bike.description ? (
                <p className="mt-5 leading-relaxed text-foreground/80">{bike.description}</p>
              ) : null}

              <div className="mt-7">
                <BikeActions
                  bike={{
                    bikeId: bike.id,
                    sku: bike.sku,
                    brand: bike.brand,
                    model: bike.model,
                    priceCents: bike.priceCents,
                    photo,
                  }}
                  status={bike.status}
                  userEmail={session?.user?.email ?? undefined}
                  paymentsLive={paymentsLive}
                />
                <p className="mt-3 text-sm text-steel">
                  Cu acte, verificare tehnică și garanție legală de conformitate ({WARRANTY_MONTHS} luni).
                </p>
              </div>
            </div>
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-heading text-lg font-semibold tracking-tight">Fișă tehnică</h2>
              <dl className="mt-4 border-t border-border">
                {specs.map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-4 border-b border-border py-2.5">
                    <dt className="font-mono text-xs uppercase tracking-[0.1em] text-steel">{k}</dt>
                    <dd className="font-mono text-sm text-foreground/90">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {bike.workDone.length > 0 ? (
              <div>
                <h2 className="font-heading text-lg font-semibold tracking-tight">Ce am făcut</h2>
                <ul className="mt-4 space-y-2">
                  {bike.workDone.map((w) => (
                    <li key={w} className="flex gap-2.5 text-sm text-foreground/80">
                      <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-blue" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
