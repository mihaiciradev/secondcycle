import Link from "next/link";
import { Container } from "@/components/site/section";
import { company } from "@/lib/content/site";

// Compact RO footer for the legal subpages (/despre, /formular-retragere).
const disclaimer =
  "Second Cycle vinde bicicletele în nume propriu. Emitem factura, semnăm contractul de vânzare și răspundem față de cumpărător pentru fiecare bicicletă.";

const legalLinks = [
  { href: "/despre", label: "Ce facem" },
  { href: "/date-legale", label: "Date legale" },
  { href: "/formular-retragere", label: "Formular de retragere" },
  { href: "/termeni", label: "Termeni și condiții" },
  { href: "/confidentialitate", label: "Politica de confidențialitate" },
  { href: "/cookies", label: "Politica de cookies" },
];

export function SiteFooter() {
  return (
    <footer className="bg-asphalt text-paper">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div className="max-w-sm">
            <p className="font-heading text-lg font-bold tracking-tight">
              {company.name}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-paper/70">
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

        <div className="mt-12 flex flex-col gap-2 border-t border-paper/15 pt-6 text-xs text-paper/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {company.name}. Toate drepturile rezervate.
          </p>
          <p className="font-mono">{company.city}, România</p>
        </div>
      </Container>
    </footer>
  );
}
