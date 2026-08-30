import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/site/section";
import { SiteFooter } from "@/components/site/site-footer";
import { company } from "@/lib/content/site";
import { BrandLogo } from "@/components/site/brand-logo";

export const metadata: Metadata = {
  title: "Politica de cookies",
  description:
    "Ce cookie-uri și stocare locală folosește Second Cycle: doar strictul necesar pentru autentificare și coș, fără urmărire.",
};

const UPDATED = "30 august 2026";

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-10 font-heading text-xl font-semibold tracking-tight">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 leading-relaxed text-foreground/80">{children}</p>;
}

const cookies: { name: string; purpose: string; type: string; life: string }[] = [
  {
    name: "authjs.session-token (și varianta __Secure-)",
    purpose: "Te menține autentificat între pagini. httpOnly, nu poate fi citit din JavaScript.",
    type: "Strict necesar",
    life: "Sesiune / până la 30 de zile",
  },
  {
    name: "authjs.csrf-token",
    purpose: "Protejează formularele de autentificare împotriva atacurilor CSRF.",
    type: "Strict necesar",
    life: "Sesiune",
  },
  {
    name: "authjs.callback-url",
    purpose: "Reține pagina la care te întorci după autentificare.",
    type: "Strict necesar",
    life: "Sesiune",
  },
];

const storage: { name: string; purpose: string }[] = [
  {
    name: "sc_cart_v1 (localStorage)",
    purpose: "Ține minte bicicletele din coșul tău pe acest dispozitiv. Nu ajunge pe serverele noastre decât când plasezi comanda.",
  },
  {
    name: "sc_cookie_ack_v1 (localStorage)",
    purpose: "Reține că ai văzut nota despre cookie-uri, ca să nu ți-o mai arătăm.",
  },
];

export default function CookiesPage() {
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
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-steel">Legal</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Politica de cookies</h1>
          <p className="mt-3 font-mono text-sm text-steel">Ultima actualizare: {UPDATED}</p>

          <P>
            Ținem lucrurile simple: folosim doar cookie-uri strict necesare pentru ca site-ul să
            funcționeze și un pic de stocare locală pentru coșul tău. Nu folosim cookie-uri de
            analiză sau de publicitate și nu te urmărim pe alte site-uri. De aceea nici nu-ți cerem
            să „accepți" cookie-uri de marketing: nu avem așa ceva.
          </P>

          <H2>Cookie-uri strict necesare</H2>
          <P>
            Acestea sunt indispensabile pentru autentificare și securitate. Conform legii, nu
            necesită consimțământ, dar preferăm să fim transparenți cu ele:
          </P>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left font-mono text-xs uppercase tracking-wider text-steel">
                  <th className="py-2 pr-4">Cookie</th>
                  <th className="py-2 pr-4">Scop</th>
                  <th className="py-2 pr-4">Tip</th>
                  <th className="py-2">Durată</th>
                </tr>
              </thead>
              <tbody>
                {cookies.map((c) => (
                  <tr key={c.name} className="border-b border-border/70 align-top">
                    <td className="py-3 pr-4 font-mono text-xs">{c.name}</td>
                    <td className="py-3 pr-4 text-foreground/80">{c.purpose}</td>
                    <td className="py-3 pr-4 text-foreground/80">{c.type}</td>
                    <td className="py-3 text-foreground/80">{c.life}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <H2>Stocare locală (nu sunt cookie-uri)</H2>
          <P>
            Pentru funcții de bază folosim „localStorage" din browserul tău. Rămâne pe dispozitivul
            tău și nu e trimisă automat către noi:
          </P>
          <ul className="mt-4 space-y-2">
            {storage.map((s) => (
              <li key={s.name} className="flex gap-2.5 leading-relaxed text-foreground/80">
                <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-blue" />
                <span>
                  <span className="font-mono text-sm">{s.name}</span>: {s.purpose}
                </span>
              </li>
            ))}
          </ul>

          <H2>Ce NU folosim</H2>
          <P>
            Fără Google Analytics sau alte instrumente de analiză, fără pixeli de publicitate, fără
            cookie-uri de la rețele sociale și fără vânzarea datelor tale. Punct.
          </P>

          <H2>Servicii ale terților</H2>
          <P>
            Plata este procesată de Stripe, pe paginile lor securizate; cookie-urile setate acolo
            sunt guvernate de politica Stripe. Dacă alegi „Continuă cu Google", autentificarea e
            gestionată de Google conform politicii lor. Aceste servicii intervin doar când le
            folosești tu.
          </P>

          <H2>Cum le controlezi</H2>
          <P>
            Poți șterge sau bloca cookie-urile din setările browserului. Reține că, dacă blochezi
            cookie-urile strict necesare, autentificarea nu va mai funcționa. Dacă adăugăm vreodată
            instrumente de analiză, vom actualiza această pagină și îți vom cere consimțământul
            explicit, așa cum cere legea.
          </P>

          <H2>Contact</H2>
          <P>
            Întrebări despre cookie-uri sau date personale: {company.contact.email}. Operator:{" "}
            {company.legal.entityName}, {company.legal.address}. Vezi și{" "}
            <Link href="/privacy" className="text-blue underline-offset-2 hover:underline">
              Politica de confidențialitate
            </Link>
            .
          </P>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
