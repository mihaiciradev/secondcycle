import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/server/db/client";
import { getValuationByToken } from "@/server/services/valuations";
import { isStorageEnabled, publicUrl } from "@/server/storage/r2";
import { bikeTitle } from "@/lib/bike-name";
import { techSheetEntries } from "@/lib/tech-sheet";
import { BrandLogo } from "@/components/site/brand-logo";
import { Container } from "@/components/site/section";
import { ValuationForm } from "@/components/valuations/valuation-form";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Private, one-to-one opinion between us and a mechanic: never indexed.
export const metadata: Metadata = {
  title: "Părere de preț",
  robots: { index: false, follow: false },
};

const CATEGORY_LABEL: Record<string, string> = {
  city: "Oraș",
  trekking: "Trekking",
  mtb: "MTB",
  road: "Cursieră",
  kids: "Copii",
  ebike: "Electrică",
};

function toLei(cents: number | null): string {
  return cents != null ? String(Math.round(cents) / 100) : "";
}

export default async function ValuationPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ nume?: string }>;
}) {
  const { token } = await params;
  const { nume } = await searchParams;

  const data = await getValuationByToken(db, token);
  if (!data) notFound();
  const { valuation, bike } = data;

  const photos = isStorageEnabled() ? bike.photos.map((key) => publicUrl(key)) : [];
  const specs = techSheetEntries(bike.techSheet);

  const meta: string[] = [
    CATEGORY_LABEL[bike.category] ?? bike.category,
    bike.modelYear ? `An ${bike.modelYear}` : "",
    bike.frameSize ? `Cadru ${bike.frameSize}` : "",
    bike.wheelSize ? `Roți ${bike.wheelSize}` : "",
  ].filter(Boolean);

  const submitted = Boolean(valuation.submittedAt);

  return (
    <>
      <header className="border-b border-border/80 bg-paper/90 backdrop-blur">
        <Container className="flex h-16 items-center">
          <BrandLogo tone="light" height={48} priority />
        </Container>
      </header>

      <main id="continut" className="flex-1 py-12 sm:py-16">
        <Container className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-steel">
            Părere de preț · confidențial
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Cât face bicicleta asta?
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-foreground/80">
            Second Cycle evaluează bicicleta de mai jos. Spune-ne, te rugăm, cât crezi că face pe
            piață și cât ai da tu pe ea. E o părere privată, nu apare public nicăieri.
          </p>

          {/* The bike under review */}
          <section className="mt-10 overflow-hidden rounded-xl border border-border bg-card">
            {photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-1 bg-border sm:grid-cols-3">
                {photos.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt={`${bikeTitle(bike)} - poza ${i + 1}`}
                    loading={i > 2 ? "lazy" : "eager"}
                    className="aspect-square w-full bg-manila/40 object-cover"
                  />
                ))}
              </div>
            ) : (
              <div className="flex aspect-[3/1] items-center justify-center bg-manila/40 text-sm text-steel">
                Fără poze încărcate.
              </div>
            )}

            <div className="p-5 sm:p-6">
              <h2 className="font-heading text-xl font-semibold tracking-tight">{bikeTitle(bike)}</h2>
              {meta.length > 0 ? (
                <p className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1 text-sm text-steel">
                  {meta.map((m, i) => (
                    <span key={m}>
                      {i > 0 ? <span className="mr-2 text-steel/50">·</span> : null}
                      {m}
                    </span>
                  ))}
                </p>
              ) : null}

              {bike.description ? (
                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground/80">
                  {bike.description}
                </p>
              ) : null}

              {specs.length > 0 ? (
                <dl className="mt-5 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                  {specs.map((s) => (
                    <div key={s.key} className="flex justify-between gap-3 border-b border-border/60 pb-2">
                      <dt className="text-sm text-steel">{s.label}</dt>
                      <dd className="text-right text-sm font-medium text-foreground/90">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
          </section>

          {/* The opinion form */}
          <section className="mt-10">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">Părerea ta</h2>
            {submitted ? (
              <p className="mt-1 text-sm text-steel">
                Ai trimis deja o părere. O poți actualiza mai jos.
              </p>
            ) : null}
            <div className="mt-5">
              <ValuationForm
                token={token}
                alreadySubmitted={submitted}
                defaults={{
                  name: valuation.respondentName ?? nume ?? valuation.suggestedName ?? "",
                  marketLei: toLei(valuation.marketValueCents),
                  suggestedLei: toLei(valuation.suggestedSpendCents),
                  notWorth: valuation.notWorth,
                  notes: valuation.notes ?? "",
                }}
              />
            </div>
          </section>
        </Container>
      </main>

      <footer className="border-t border-border/80 py-8">
        <Container>
          <p className="text-xs text-steel">Second Cycle · pagină privată de evaluare</p>
        </Container>
      </footer>
    </>
  );
}
