import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/site/section";
import { SiteFooter } from "@/components/site/site-footer";
import { company } from "@/lib/content/site";
import { BrandLogo } from "@/components/site/brand-logo";

export const metadata: Metadata = {
  title: "Termeni și condiții",
  description: "Termenii și condițiile Second Cycle. Conținut în curs de completare.",
};

export default function TermsPage() {
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
            Legal
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Termeni și condiții
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-foreground/80">
            Conținutul acestei pagini este în curs de completare. Aici vor fi
            descriși termenii de utilizare a platformei și condițiile de vânzare.
          </p>
          <p className="mt-6 text-sm text-steel">
            Vânzătorul este {company.legal.entityName}. Ne poți contacta la{" "}
            {company.contact.email}.
          </p>
        </Container>
      </main>

      <SiteFooter />
    </>
  );
}
