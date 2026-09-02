import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/server/db/client";
import { getPurchasedBikesForUser } from "@/server/services/returns";
import { Container } from "@/components/site/section";
import { SiteFooter } from "@/components/site/site-footer";
import { BrandLogo } from "@/components/site/brand-logo";
import { ReturnForm } from "@/components/returns/return-form";
import { company } from "@/lib/content/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Retur (drept de retragere)",
  description:
    "Ai 14 zile de la primirea bicicletei ca să te retragi din contract, fără să dai un motiv. Trimite cererea de retur de aici.",
};

/** A single blank line to be filled in on the printable document. */
function Blank({ label }: { label: string }) {
  return (
    <p className="mt-4">
      <span className="text-foreground/80">{label}</span>
      <span className="mt-1 block h-6 border-b border-dashed border-asphalt/30" />
    </p>
  );
}

export default async function ReturPage() {
  const session = await auth();
  const waNumber = company.contact.phone.replace(/\D/g, "");

  const purchased = session?.user?.id ? await getPurchasedBikesForUser(db, session.user.id) : [];
  const first = purchased[0];
  const defaults = {
    name: first?.billingName ?? "",
    email: first?.billingEmail ?? session?.user?.email ?? "",
    phone: first?.billingPhone ?? "",
  };

  return (
    <>
      <header className="border-b border-border/80 bg-paper/90 backdrop-blur">
        <Container className="flex h-16 items-center justify-between">
          <Link
            href="/"
            aria-label={company.name}
            className="inline-flex items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <BrandLogo tone="light" height={52} priority />
          </Link>
          <Link
            href="/"
            className="rounded-sm text-sm text-foreground/75 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            ← Înapoi la pagina principală
          </Link>
        </Container>
      </header>

      <main id="continut" className="flex-1 py-16 sm:py-24">
        <Container className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-steel">
            Drept de retragere · 14 zile
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Retur bicicletă</h1>
          <p className="mt-4 text-lg leading-relaxed text-foreground/80">
            Ai 14 zile de la primirea fizică a bicicletei ca să te retragi din contract, fără să dai
            un motiv. Ne anunți, ne trimiți bicicleta înapoi, iar noi îți rambursăm suma în cel mult
            14 zile de la anunț. Transportul de retur este suportat de cumpărător.
          </p>

          {purchased.length > 0 ? (
            <section className="mt-10">
              <h2 className="font-heading text-xl font-semibold tracking-tight">
                Trimite cererea de retur
              </h2>
              <p className="mt-1 text-sm text-steel">
                Bicicletele de mai jos sunt cele cumpărate de tine. Alege ce vrei să returnezi.
              </p>
              <div className="mt-4">
                <ReturnForm
                  bikes={purchased.map((b) => ({
                    bikeId: b.bikeId,
                    sku: b.sku,
                    brand: b.brand,
                    model: b.model,
                    priceCents: b.priceCents,
                    orderNumber: b.orderNumber,
                  }))}
                  defaults={defaults}
                  waNumber={waNumber}
                  supportEmail={company.contact.email}
                />
              </div>
            </section>
          ) : (
            <div className="mt-8 rounded-lg border border-border bg-card p-6">
              <p className="text-sm leading-relaxed text-foreground/80">
                {session?.user?.id
                  ? "Nu găsim nicio bicicletă cumpărată pe acest cont. Dacă ai cumpărat cu alt cont sau ca invitat, trimite-ne cererea pe e-mail sau WhatsApp, cu serialul bicicletei."
                  : "Autentifică-te ca să încarci automat bicicletele cumpărate, sau trimite-ne cererea pe e-mail ori WhatsApp, cu serialul bicicletei."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {!session?.user?.id ? (
                  <Link
                    href="/login"
                    className="inline-flex h-9 items-center rounded-full bg-asphalt px-4 text-sm font-semibold text-paper transition-colors hover:bg-asphalt/90"
                  >
                    Autentifică-te
                  </Link>
                ) : null}
                <a
                  href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                    "Salut! Vreau să mă retrag din contract (retur) pentru bicicleta cu serialul ..."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#25D366] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#20bd5a]"
                >
                  WhatsApp
                </a>
                <a
                  href={`mailto:${company.contact.email}?subject=${encodeURIComponent("Cerere de retur")}`}
                  className="inline-flex h-9 items-center rounded-full border border-asphalt/25 px-4 text-sm font-semibold text-foreground transition-colors hover:border-asphalt/50"
                >
                  E-mail
                </a>
              </div>
            </div>
          )}

          {/* The formal document, always available (print or attach). */}
          <section className="mt-14">
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              Formular standard de retragere
            </h2>
            <p className="mt-1 text-sm text-steel">
              Nu ești obligat să folosești acest formular, dar ți-l punem la dispoziție.
            </p>
            <div className="mt-4 rounded border border-border bg-card p-6 sm:p-8">
              <p className="text-sm text-steel">Către:</p>
              <div className="mt-2 font-mono text-sm leading-relaxed text-foreground/90">
                <p>{company.legal.entityName}</p>
                <p>{company.legal.address}</p>
                <p>{company.contact.email}</p>
              </div>

              <hr className="my-6 border-border" />

              <p className="leading-relaxed text-foreground/80">
                Vă informez prin prezenta cu privire la retragerea mea din contractul referitor la
                vânzarea următoarei biciclete:
              </p>

              <Blank label="Bicicleta (serial și descriere):" />
              <Blank label="Comandată la data / primită la data de:" />
              <Blank label="Numele consumatorului:" />
              <Blank label="Adresa consumatorului:" />
              <Blank label="Semnătura consumatorului (doar dacă trimiți formularul pe hârtie):" />
              <Blank label="Data:" />
            </div>
          </section>
        </Container>
      </main>

      <SiteFooter />
    </>
  );
}
