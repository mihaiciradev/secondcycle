import Link from "next/link";
import { BrandLogo } from "@/components/site/brand-logo";

/** Interior-page header (catalogue, account, admin). The home page has its own. */
export function SiteHeader({ admin = false }: { admin?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          aria-label="Second Cycle"
          className="inline-flex items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <BrandLogo tone="light" height={40} priority />
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/bikes" className="rounded-sm text-foreground/75 hover:text-foreground">
            Biciclete
          </Link>
          {admin ? (
            <Link href="/admin/bikes" className="rounded-sm text-foreground/75 hover:text-foreground">
              Admin
            </Link>
          ) : null}
          <Link href="/account" className="rounded-sm text-foreground/75 hover:text-foreground">
            Cont
          </Link>
        </nav>
      </div>
    </header>
  );
}
