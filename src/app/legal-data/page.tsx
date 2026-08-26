import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/site/section";
import { SiteFooter } from "@/components/site/site-footer";
import { company } from "@/lib/content/site";
import { BrandLogo } from "@/components/site/brand-logo";

export const metadata: Metadata = {
  title: "Date legale",
  description:
    "Second Cycle este un proiect al WEBBINGHUB S.R.L. Datele de identificare ale societății, sediul social și datele de contact.",
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-t border-border py-4 sm:flex-row sm:items-baseline sm:gap-6">
      <dt className="w-48 shrink-0 font-mono text-xs uppercase tracking-[0.12em] text-steel">
        {label}
      </dt>
      <dd className="font-mono text-sm text-foreground/90">{value}</dd>
    </div>
  );
}

export default function LegalPage() {
  return (
    <>
      <header className="border-b border-border/80 bg-paper/90 backdrop-blur">
        <Container className="flex h-16 items-center justify-between">
          <Link
            href="/"
            aria-label={company.name}
            className="inline-flex items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <BrandLogo tone="light" height={28} priority />
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
            Date legale
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Cine vinde, de fapt
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-foreground/80">
            Second Cycle este un proiect al {company.legal.entityName}, societatea
            care vinde în nume propriu: emite factura, semnează contractul de
            vânzare și răspunde față de cumpărător pentru fiecare bicicletă.
          </p>

          <dl className="mt-10 border-b border-border">
            <Row label="Societate" value={company.legal.entityName} />
            <Row label="Cod de identificare" value={company.legal.cui} />
            <Row label="Registrul comerțului" value={company.legal.tradeRegister} />
            <Row label="Sediu social" value={company.legal.address} />
            <Row label="E-mail" value={company.contact.email} />
            <Row label="Telefon" value={company.contact.phone} />
          </dl>

          <p className="mt-8 text-sm leading-relaxed text-steel">
            Marca Second Cycle și platforma sunt operate de {company.legal.entityName},
            cu datele de identificare de mai sus. Pentru orice sesizare legată de o
            comandă, folosește datele de contact.
          </p>
        </Container>
      </main>

      <SiteFooter />
    </>
  );
}
