import Link from "next/link";
import { BrandLogo } from "@/components/site/brand-logo";

export const fieldClass =
  "w-full rounded-md border border-input bg-white px-3.5 py-2.5 text-sm text-asphalt outline-none transition-shadow placeholder:text-steel/70 focus-visible:border-blue focus-visible:ring-2 focus-visible:ring-blue/20";
export const labelClass = "mb-1.5 block text-sm font-medium text-foreground/80";
export const primaryBtn =
  "inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-full bg-blue px-6 text-sm font-semibold text-white transition-colors hover:bg-blue/90 disabled:cursor-not-allowed disabled:opacity-60";
export const outlineBtn =
  "inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2.5 rounded-full border border-asphalt/20 bg-white px-6 text-sm font-medium text-asphalt transition-colors hover:bg-asphalt/5 disabled:cursor-not-allowed disabled:opacity-60";

const PROMISES = [
  "Verificare tehnică pe fiecare bicicletă",
  "Acte de proprietate și factură",
  "Garanție și drept de retur 14 zile",
];

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between bg-asphalt p-12 text-paper lg:flex">
        <Link
          href="/"
          aria-label="Second Cycle"
          className="inline-flex w-fit items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <BrandLogo tone="dark" height={44} priority />
        </Link>
        <div className="max-w-md">
          <h2 className="font-heading text-3xl font-bold leading-[1.1] tracking-tight">
            Bicicleta ta de mâna a doua, cu acte și garanție.
          </h2>
          <ul className="mt-8 space-y-3.5">
            {PROMISES.map((p) => (
              <li key={p} className="flex items-center gap-3 text-paper/85">
                <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-paper/45">
          Second Cycle · Timișoara
        </p>
      </aside>

      {/* Form panel */}
      <section className="flex flex-col bg-paper">
        <div className="flex items-center justify-between border-b border-border/70 px-6 py-4 lg:hidden">
          <Link href="/" aria-label="Second Cycle" className="inline-flex items-center">
            <BrandLogo tone="light" height={34} priority />
          </Link>
          <Link href="/" className="text-sm text-foreground/70 hover:text-foreground">
            Acasă
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-12 sm:py-16">
          <div className="w-full max-w-sm">
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
            {subtitle ? (
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">{subtitle}</p>
            ) : null}
            <div className="mt-8">{children}</div>
            {footer ? (
              <div className="mt-8 border-t border-border pt-6 text-sm text-foreground/70">{footer}</div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
