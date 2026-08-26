import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/server/db/client";
import { getUserById } from "@/server/services/auth";
import { adminListBikes } from "@/server/services/bikes";
import { SiteHeader } from "@/components/site/site-header";
import { BikeCreateForm } from "@/components/admin/bike-create-form";
import { BikeRowActions } from "@/components/admin/bike-row-actions";
import { formatLei } from "@/lib/money";
import type { BikeStatus } from "@/server/constants/statuses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  draft: "Ciornă",
  available: "Disponibilă",
  reserved: "Rezervată",
  sold: "Vândută",
  withdrawn: "Retrasă",
};

export default async function AdminBikesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await getUserById(db, session.user.id);
  if (!me || me.role !== "admin") redirect("/");

  const bikes = await adminListBikes(db);

  return (
    <>
      <SiteHeader admin />
      <main id="continut" className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-steel">Admin</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Biciclete</h1>

          <section className="mt-8 rounded border border-border bg-card p-5 sm:p-6">
            <h2 className="font-heading text-lg font-semibold tracking-tight">Adaugă o bicicletă</h2>
            <div className="mt-4">
              <BikeCreateForm />
            </div>
          </section>

          <section className="mt-10">
            <h2 className="font-heading text-lg font-semibold tracking-tight">
              Stoc ({bikes.length})
            </h2>
            {bikes.length === 0 ? (
              <p className="mt-4 text-sm text-steel">Nicio bicicletă încă.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border text-left font-mono text-xs uppercase tracking-wider text-steel">
                      <th className="py-2 pr-4">SKU</th>
                      <th className="py-2 pr-4">Bicicletă</th>
                      <th className="py-2 pr-4">Preț</th>
                      <th className="py-2 pr-4">Stare</th>
                      <th className="py-2">Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bikes.map((b) => (
                      <tr key={b.id} className="border-b border-border/70">
                        <td className="py-3 pr-4 font-mono text-xs">
                          <Link href={`/bikes/${b.sku}`} className="hover:underline">
                            {b.sku}
                          </Link>
                        </td>
                        <td className="py-3 pr-4">
                          {b.brand} {b.model}
                        </td>
                        <td className="py-3 pr-4 font-mono">{formatLei(b.priceCents)}</td>
                        <td className="py-3 pr-4">{statusLabel[b.status] ?? b.status}</td>
                        <td className="py-3">
                          <BikeRowActions id={b.id} status={b.status as BikeStatus} />
                        </td>
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
