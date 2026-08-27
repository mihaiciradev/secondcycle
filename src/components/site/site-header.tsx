import Link from "next/link";
import { auth } from "@/auth";
import { BrandLogo } from "@/components/site/brand-logo";

/** Interior-page header (catalogue, account, admin). Reflects auth state. */
export async function SiteHeader() {
  const session = await auth();
  const authed = Boolean(session?.user?.id);
  const isAdmin = session?.user?.role === "admin";

  const link = "rounded-sm text-sm text-foreground/75 transition-colors hover:text-foreground";

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          aria-label="Second Cycle"
          className="inline-flex items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <BrandLogo tone="light" height={56} priority />
        </Link>
        <nav className="flex items-center gap-5 sm:gap-6">
          <Link href="/bikes" className={link}>
            Biciclete
          </Link>
          {isAdmin ? (
            <Link href="/admin/bikes" className={link}>
              Admin
            </Link>
          ) : null}
          {authed ? (
            <Link href="/account" className={link}>
              Cont
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-9 items-center rounded-full bg-blue px-4 text-sm font-semibold text-white transition-colors hover:bg-blue/90"
            >
              Autentificare
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
