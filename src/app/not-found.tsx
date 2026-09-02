import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/site/section";
import { SiteFooter } from "@/components/site/site-footer";
import { BrandLogo } from "@/components/site/brand-logo";
import { company } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Pagina nu a fost găsită",
  description: "Pagina pe care o cauți nu există sau a fost mutată.",
  robots: { index: false, follow: true },
};

const links = [
  { href: "/bikes", label: "Bicicletele" },
  { href: "/sell", label: "Vinde-ți bicicleta" },
  { href: "/about", label: "Ce facem" },
  { href: "/account", label: "Contul tău" },
];

export default function NotFound() {
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

      <main className="flex flex-1 items-center">
        <section className="w-full py-16 sm:py-24">
          <Container className="max-w-2xl text-center">
            <div className="flex items-center justify-center gap-3 sm:gap-5" aria-hidden="true">
              <span className="font-heading text-[6rem] font-bold leading-none tracking-tight text-asphalt sm:text-[9rem]">
                4
              </span>
              <Wheel />
              <span className="font-heading text-[6rem] font-bold leading-none tracking-tight text-asphalt sm:text-[9rem]">
                4
              </span>
            </div>

            <p className="mt-8 font-mono text-xs uppercase tracking-[0.14em] text-steel">
              Eroare 404
            </p>
            <h1 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Se pare că a sărit lanțul.
            </h1>
            <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-foreground/80">
              Pagina pe care o cauți nu există sau a fost mutată. Te punem înapoi pe drum.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/bikes"
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-asphalt px-7 text-base font-semibold text-paper transition-colors hover:bg-asphalt/90 sm:w-auto"
              >
                Vezi bicicletele
              </Link>
              <Link
                href="/"
                className="inline-flex h-12 w-full items-center justify-center rounded-full border border-asphalt/20 px-7 text-base font-medium text-asphalt transition-colors hover:bg-asphalt/5 sm:w-auto"
              >
                Pagina principală
              </Link>
            </div>

            <div className="mt-12 border-t border-border/70 pt-6">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-steel">
                Poate căutai
              </p>
              <ul className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-foreground/75 underline-offset-4 transition-colors hover:text-foreground hover:underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

/** The middle "0" of 404, drawn as a bike wheel. */
function Wheel() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="h-[5.5rem] w-[5.5rem] text-asphalt sm:h-32 sm:w-32"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="44" strokeWidth="5" />
      <circle cx="50" cy="50" r="7" strokeWidth="5" className="text-blue" stroke="currentColor" />
      <g strokeWidth="2.5" className="text-asphalt/55" stroke="currentColor">
        <line x1="50" y1="7" x2="50" y2="93" />
        <line x1="7" y1="50" x2="93" y2="50" />
        <line x1="19.6" y1="19.6" x2="80.4" y2="80.4" />
        <line x1="80.4" y1="19.6" x2="19.6" y2="80.4" />
      </g>
    </svg>
  );
}
