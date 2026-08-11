import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/site/section";
import { SiteFooter } from "@/components/site/site-footer";
import { company } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Formular de retragere",
  description:
    "Formularul standard de retragere. Îl completezi și ni-l trimiți doar dacă vrei să te retragi din contract, în termen de 14 zile de la predare.",
};

/** A single blank line to be filled in by the consumer (on paper or screen). */
function Blank({ label }: { label: string }) {
  return (
    <p className="mt-4">
      <span className="text-foreground/80">{label}</span>
      <span className="mt-1 block h-6 border-b border-dashed border-asphalt/30" />
    </p>
  );
}

export default function WithdrawalFormPage() {
  return (
    <>
      <header className="border-b border-border/80 bg-paper/90 backdrop-blur">
        <Container className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="rounded-sm font-heading text-lg font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {company.name}
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
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Formular de retragere
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-foreground/80">
            Completează și trimite acest formular doar dacă vrei să te retragi din
            contract. Nu ești obligat să folosești acest formular. Un e-mail clar
            e suficient, dar ți-l punem la dispoziție. Termenul este de 14 zile de
            la predarea fizică a bicicletei.
          </p>

          <div className="mt-10 rounded border border-border bg-card p-6 sm:p-8">
            <p className="text-sm text-steel">Către:</p>
            <div className="mt-2 font-mono text-sm leading-relaxed text-foreground/90">
              <p>{company.legal.entityName}</p>
              <p>{company.legal.address}</p>
              <p>{company.contact.email}</p>
            </div>

            <hr className="my-6 border-border" />

            <p className="leading-relaxed text-foreground/80">
              Vă informez prin prezenta cu privire la retragerea mea din contractul
              referitor la vânzarea următoarei biciclete:
            </p>

            <Blank label="Bicicleta (serial și descriere):" />
            <Blank label="Comandată la data / primită la data de:" />
            <Blank label="Numele consumatorului:" />
            <Blank label="Adresa consumatorului:" />
            <Blank label="Semnătura consumatorului (doar dacă trimiți formularul pe hârtie):" />
            <Blank label="Data:" />
          </div>

          <p className="mt-8 text-sm leading-relaxed text-steel">
            Transportul de retur este suportat de cumpărător. După ce primim
            anunțul de retragere, îți rambursăm suma în cel mult 14 zile.
          </p>
        </Container>
      </main>

      <SiteFooter />
    </>
  );
}
