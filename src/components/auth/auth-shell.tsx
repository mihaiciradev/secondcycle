import Link from "next/link";
import { BrandLogo } from "@/components/site/brand-logo";

export const fieldClass =
  "w-full rounded border border-input bg-white px-3 py-2.5 text-sm outline-none focus-visible:border-blue focus-visible:ring-2 focus-visible:ring-blue/20";
export const primaryBtn =
  "inline-flex h-11 w-full items-center justify-center rounded-full bg-blue px-6 text-sm font-semibold text-white transition-colors hover:bg-blue/90 disabled:opacity-60";
export const outlineBtn =
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-asphalt/20 bg-white px-6 text-sm font-medium transition-colors hover:bg-asphalt/5 disabled:opacity-60";

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
    <main className="flex min-h-screen flex-col bg-paper text-asphalt">
      <div className="border-b border-border/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-5 sm:px-8">
          <Link
            href="/"
            aria-label="Second Cycle"
            className="inline-flex items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <BrandLogo tone="light" height={40} priority />
          </Link>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center px-5 py-12 sm:py-16">
        <div className="w-full max-w-sm">
          <h1 className="font-heading text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm leading-relaxed text-foreground/70">{subtitle}</p> : null}
          <div className="mt-6">{children}</div>
          {footer ? <div className="mt-6 text-sm text-foreground/70">{footer}</div> : null}
        </div>
      </div>
    </main>
  );
}
