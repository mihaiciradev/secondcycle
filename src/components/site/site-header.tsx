import Link from "next/link";
import { nav } from "@/lib/content/site";
import { Container } from "@/components/site/section";
import { Cta } from "@/components/site/cta";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-paper/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="rounded-sm font-heading text-lg font-bold tracking-tight outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {nav.brand}
        </Link>

        <nav aria-label="Navigare principală" className="hidden items-center gap-6 md:flex">
          {nav.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-sm text-sm text-foreground/75 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Cta href={nav.primaryCta.href} size="md" className="shrink-0">
          {nav.primaryCta.label}
        </Cta>
      </Container>
    </header>
  );
}
