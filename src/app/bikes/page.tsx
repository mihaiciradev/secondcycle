import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/server/db/client";
import { listPublicBikes } from "@/server/services/bikes";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { BikeCard } from "@/components/bikes/bike-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Biciclete în stoc",
  description:
    "Biciclete second-hand verificate, reparate și vândute cu acte și garanție. Fiecare bicicletă e un unicat.",
};

const CATEGORIES = [
  { key: "", label: "Toate" },
  { key: "city", label: "Oraș" },
  { key: "trekking", label: "Trekking" },
  { key: "mtb", label: "Munte" },
  { key: "road", label: "Cursieră" },
  { key: "kids", label: "Copii" },
] as const;

function chip(active: boolean) {
  return `rounded-full border px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
    active
      ? "border-asphalt bg-asphalt text-paper"
      : "border-border text-foreground/75 hover:border-asphalt/50"
  }`;
}

export default async function BikesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; cursor?: string }>;
}) {
  const sp = await searchParams;
  const category = sp.category || undefined;

  const { items, nextCursor } = await listPublicBikes(db, {
    category: category as never,
    cursor: sp.cursor,
  });

  const withParams = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { category, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const qs = params.toString();
    return qs ? `/bikes?${qs}` : "/bikes";
  };

  return (
    <>
      <SiteHeader />
      <main id="continut" className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-steel">Stoc</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Biciclete în stoc</h1>
          <p className="mt-3 max-w-2xl text-foreground/75">
            Fiecare bicicletă e un unicat, verificată tehnic și vândută cu acte și garanție.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Link key={c.key} href={withParams({ category: c.key || undefined, cursor: undefined })} className={chip((category ?? "") === c.key)}>
                {c.label}
              </Link>
            ))}
          </div>
          {items.length === 0 ? (
            <div className="mt-12 rounded border border-dashed border-border p-12 text-center text-steel">
              Nu sunt biciclete în acest filtru deocamdată.
            </div>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((bike) => (
                <BikeCard key={bike.id} bike={bike} />
              ))}
            </div>
          )}

          {nextCursor ? (
            <div className="mt-10 flex justify-center">
              <Link
                href={withParams({ cursor: nextCursor })}
                className="inline-flex h-11 items-center rounded-full border border-asphalt px-6 text-sm font-medium transition-colors hover:bg-asphalt hover:text-paper"
              >
                Vezi mai multe
              </Link>
            </div>
          ) : null}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
