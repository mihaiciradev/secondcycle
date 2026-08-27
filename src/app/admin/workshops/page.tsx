import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/server/db/client";
import { getUserById } from "@/server/services/auth";
import { listWorkshops } from "@/server/services/workshops";
import { SiteHeader } from "@/components/site/site-header";
import { WorkshopCreateForm } from "@/components/admin/workshop-create-form";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminWorkshopsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await getUserById(db, session.user.id);
  if (!me || me.role !== "admin") redirect("/");

  const rows = await listWorkshops(db);

  return (
    <>
      <SiteHeader />
      <main id="continut" className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-steel">Admin</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight">Ateliere</h1>
            <div className="flex gap-4 text-sm">
              <Link href="/admin/bikes" className="text-blue underline-offset-2 hover:underline">
                Biciclete →
              </Link>
              <Link href="/admin/orders" className="text-blue underline-offset-2 hover:underline">
                Comenzi →
              </Link>
            </div>
          </div>

          <section className="mt-8 rounded-lg border border-border bg-card p-5 sm:p-6">
            <h2 className="font-heading text-lg font-semibold tracking-tight">Adaugă un atelier</h2>
            <div className="mt-4">
              <WorkshopCreateForm />
            </div>
          </section>

          <section className="mt-10">
            <h2 className="font-heading text-lg font-semibold tracking-tight">Ateliere ({rows.length})</h2>
            {rows.length === 0 ? (
              <p className="mt-4 text-sm text-steel">Niciun atelier încă.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border text-left font-mono text-xs uppercase tracking-wider text-steel">
                      <th className="py-2 pr-4">Atelier</th>
                      <th className="py-2 pr-4">Locație</th>
                      <th className="py-2 pr-4">Program</th>
                      <th className="py-2 pr-4">Cont</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(({ workshop, accountEmail }) => (
                      <tr key={workshop.id} className="border-b border-border/70">
                        <td className="py-3 pr-4 font-medium">{workshop.name}</td>
                        <td className="py-3 pr-4 text-foreground/80">{workshop.location ?? "-"}</td>
                        <td className="py-3 pr-4 text-foreground/80">{workshop.workHours ?? "-"}</td>
                        <td className="py-3 pr-4 font-mono text-xs">{accountEmail ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
