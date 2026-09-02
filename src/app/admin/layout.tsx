import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/server/db/client";
import { getUserById } from "@/server/services/auth";
import { countPendingReturns } from "@/server/services/returns";
import { SiteHeader } from "@/components/site/site-header";
import { AdminNav } from "@/components/admin/admin-nav";
import { RoleBadge } from "@/components/auth/role-badge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await getUserById(db, session.user.id);
  if (!me || me.role !== "admin") redirect("/");

  const pendingReturns = await countPendingReturns(db);

  return (
    <>
      <SiteHeader />
      <main id="continut" className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          <div className="flex items-center gap-3">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-steel">Panou</p>
            <RoleBadge role="admin" />
          </div>
          <AdminNav badges={{ "/admin/returns": pendingReturns }} />
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </>
  );
}
