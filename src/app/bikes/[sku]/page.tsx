import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/server/db/client";
import { getPublicBikeBySku } from "@/server/services/bikes";
import { getPaymentsLive, getPrebookEnabled } from "@/server/services/settings";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { BikeActions } from "@/components/bikes/bike-actions";
import { BikeGallery } from "@/components/bikes/bike-gallery";
import { JsonLd } from "@/components/seo/json-ld";
import { formatLei } from "@/lib/money";
import { WARRANTY_MONTHS } from "@/server/constants/app";
import { SITE_URL, company } from "@/lib/content/site";

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, string> = {
  city: "de oraș",
  trekking: "de trekking",
  mtb: "de munte (MTB)",
  road: "cursieră",
  kids: "pentru copii",
  ebike: "electrică",
};

function assetUrl(key: string): string | null {
  const base = process.env.R2_PUBLIC_URL;
  return base ? `${base}/${key}` : null;
}

/** Factual, keyword-relevant description built from real specs. No fluff. */
function bikeDescription(bike: {
  brand: string;
  model: string;
  category: string;
  modelYear: number | null;
  frameSize: string;
  wheelSize: string;
  priceCents: number;
}): string {
  const cat = CATEGORY_LABEL[bike.category] ?? "";
  const year = bike.modelYear ? ` din ${bike.modelYear}` : "";
  return `Bicicletă ${cat} second-hand ${bike.brand} ${bike.model}${year}, mărime cadru ${bike.frameSize}, roți ${bike.wheelSize}". Verificată piesă cu piesă și reparată, cu acte, garanție ${WARRANTY_MONTHS} luni și retur în 14 zile. Preț ${formatLei(bike.priceCents)}. Livrare în toată România.`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sku: string }>;
}): Promise<Metadata> {
  const { sku } = await params;
  const bike = await getPublicBikeBySku(db, sku);
  if (!bike) return { title: "Bicicletă negăsită", robots: { index: false, follow: false } };

  const cat = CATEGORY_LABEL[bike.category] ?? "";
  const title = `${bike.brand} ${bike.model}, bicicletă ${cat} second-hand`;
  const description = bikeDescription(bike);
  const url = `${SITE_URL}/bikes/${bike.sku}`;

  // og:image / twitter:image come from the sibling opengraph-image.tsx.
  return {
    title,
    description,
    alternates: { canonical: `/bikes/${bike.sku}` },
    openGraph: {
      type: "website",
      url,
      title: `${bike.brand} ${bike.model} | Second Cycle`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${bike.brand} ${bike.model} | Second Cycle`,
      description,
    },
  };
}

export default async function BikeDetailPage({ params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;
  const bike = await getPublicBikeBySku(db, sku);
  if (!bike) notFound();

  const [session, paymentsLive, prebook] = await Promise.all([
    auth(),
    getPaymentsLive(db),
    getPrebookEnabled(db),
  ]);
  const photo = bike.photos[0] ? assetUrl(bike.photos[0]) : null;

  const url = `${SITE_URL}/bikes/${bike.sku}`;
  const photoUrls = bike.photos.map((k) => assetUrl(k)).filter((u): u is string => Boolean(u));
  const availability =
    bike.status === "available"
      ? "https://schema.org/InStock"
      : bike.status === "reserved"
        ? "https://schema.org/LimitedAvailability"
        : "https://schema.org/SoldOut";

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${bike.brand} ${bike.model}`,
    ...(photoUrls.length ? { image: photoUrls } : {}),
    description: bikeDescription(bike),
    sku: bike.sku,
    brand: { "@type": "Brand", name: bike.brand },
    category: CATEGORY_LABEL[bike.category] ?? bike.category,
    itemCondition: "https://schema.org/UsedCondition",
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "RON",
      price: (bike.priceCents / 100).toFixed(2),
      itemCondition: "https://schema.org/UsedCondition",
      availability,
      seller: { "@type": "Organization", name: company.name },
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Acasă", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Biciclete", item: `${SITE_URL}/bikes` },
      { "@type": "ListItem", position: 3, name: `${bike.brand} ${bike.model}`, item: url },
    ],
  };

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
      <JsonLd data={productLd} />
      <JsonLd data={breadcrumbLd} />
      <SiteHeader />
      <main id="continut" className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          <Link href="/bikes" className="font-mono text-xs uppercase tracking-wider text-steel hover:text-foreground">
            ← Toate bicicletele
          </Link>

          <div className="mt-6 grid gap-10 lg:grid-cols-2">
            <BikeGallery photos={photoUrls} alt={`${bike.brand} ${bike.model}`} sku={bike.sku} />

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
                <p className="mt-5 whitespace-pre-line leading-relaxed text-foreground/80">
                  {bike.description}
                </p>
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
                  prebook={prebook}
                />
                <p className="mt-3 text-sm text-steel">
                  Cu acte, verificare tehnică și garanție legală de conformitate ({WARRANTY_MONTHS} luni).
                </p>
              </div>
            </div>
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-heading text-lg font-semibold tracking-tight">Specificații</h2>
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
                <h2 className="font-heading text-lg font-semibold tracking-tight">
                  Ce am făcut în atelier
                </h2>
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
