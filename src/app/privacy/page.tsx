import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/site/section";
import { SiteFooter } from "@/components/site/site-footer";
import { company } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Politica de confidențialitate",
  description:
    "Politica de confidențialitate Second Cycle. Conținut în curs de completare.",
};

export default function PrivacyPage() {
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
            Legal
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Politica de confidențialitate
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-foreground/80">
            Conținutul acestei pagini este în curs de completare. Aici vor fi
            descrise datele pe care le colectăm, scopul prelucrării și drepturile
            tale conform GDPR.
          </p>
          <p className="mt-6 text-sm text-steel">
            Pentru orice întrebare privind datele tale, ne poți scrie la{" "}
            {company.contact.email}.
          </p>
        </Container>
      </main>

      <SiteFooter />
    </>
  );
}
