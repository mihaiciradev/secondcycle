import Link from "next/link";
import { Container } from "@/components/site/section";
import { company } from "@/lib/content/site";
import { BrandLogo } from "@/components/site/brand-logo";

// Compact RO footer for the legal subpages (/about, /withdrawal-form).
const disclaimer =
  "Second Cycle vinde bicicletele în nume propriu. Emitem factura, semnăm contractul de vânzare și răspundem față de cumpărător pentru fiecare bicicletă.";

const legalLinks = [
  { href: "/about", label: "Ce facem" },
  { href: "/legal-data", label: "Date legale" },
  { href: "/withdrawal-form", label: "Formular de retragere" },
  { href: "/retur", label: "Retur (14 zile)" },
  { href: "/terms", label: "Termeni și condiții" },
  { href: "/privacy", label: "Politica de confidențialitate" },
  { href: "/cookies", label: "Politica de cookies" },
];

export function SiteFooter() {
  return (
    <footer className="bg-asphalt text-paper">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div className="max-w-sm">
            <BrandLogo tone="dark" height={60} />
            <p className="mt-4 text-sm leading-relaxed text-paper/70">
              {disclaimer}
            </p>
          </div>

          <nav aria-label="Linkuri legale" className="flex flex-col gap-2">
            <p className="mb-1 font-mono text-xs uppercase tracking-[0.12em] text-paper/50">
              Legal
            </p>
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="w-fit rounded-sm text-sm text-paper/80 underline-offset-4 hover:text-paper hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="font-mono text-sm leading-relaxed text-paper/85">
            <p>{company.legal.entityName}</p>
            <p>{company.legal.cui}</p>
            <p>{company.legal.tradeRegister}</p>
            <p className="mt-3">{company.contact.email}</p>
            <p>{company.contact.phone}</p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-paper/15 pt-8">
          <a
            href="https://anpc.ro/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="ANPC - Autoritatea Națională pentru Protecția Consumatorilor"
            className="inline-block rounded-md bg-white p-2 transition-opacity hover:opacity-90"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/anpc.png"
              alt="Autoritatea Națională pentru Protecția Consumatorilor"
              width={150}
              className="h-auto w-[150px]"
            />
          </a>
          <a
            href="https://anpc.ro/sal"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-paper/80 underline-offset-4 hover:text-paper hover:underline"
          >
            Soluționarea Alternativă a Litigiilor (SAL)
          </a>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-paper/15 pt-6 text-xs text-paper/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {company.name}. Toate drepturile rezervate.
          </p>
          <p className="font-mono">{company.city}, România</p>
        </div>
      </Container>
    </footer>
  );
}
