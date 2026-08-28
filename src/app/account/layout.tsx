import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/server/db/client";
import { getUserById } from "@/server/services/auth";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { AccountNav } from "@/components/auth/account-nav";
import { RoleBadge } from "@/components/auth/role-badge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await getUserById(db, session.user.id);
  if (!user) redirect("/login");

  const area =
    user.role === "admin"
      ? { href: "/admin/bikes", label: "Panou admin" }
      : user.role === "workshop"
        ? { href: "/workshop", label: "Deschide atelierul" }
        : null;

  return (
    <>
      <SiteHeader />
      <main id="continut" className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
          <div className="flex items-center gap-3">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-steel">Cont</p>
            <RoleBadge role={user.role} />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight">Contul tău</h1>
            {area ? (
              <Link
                href={area.href}
                className="inline-flex h-9 items-center rounded-full bg-blue px-4 text-sm font-semibold text-white transition-colors hover:bg-blue/90"
              >
                {area.label}
              </Link>
            ) : null}
          </div>
          <div className="mt-8 grid gap-8 md:grid-cols-[180px_1fr]">
            <AccountNav role={user.role} />
            <div>{children}</div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
