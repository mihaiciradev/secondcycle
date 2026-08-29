import Link from "next/link";
import { db } from "@/server/db/client";
import { adminListBikes } from "@/server/services/bikes";
import { listActiveWorkshops } from "@/server/services/workshops";
import { BikeCreateForm } from "@/components/admin/bike-create-form";
import { BikeRowActions } from "@/components/admin/bike-row-actions";
import { WorkshopAssign } from "@/components/admin/workshop-assign";
import { formatLei } from "@/lib/money";
import type { BikeStatus } from "@/server/constants/statuses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  draft: "Ciornă",
  available: "Publicată",
  reserved: "Rezervată",
  sold: "Vândută",
  withdrawn: "Retrasă",
};

const FILTERS: { key: string; label: string }[] = [
  { key: "", label: "Toate" },
  { key: "draft", label: "Ciorne" },
  { key: "available", label: "Publicate" },
  { key: "reserved", label: "Rezervate" },
  { key: "sold", label: "Vândute" },
  { key: "withdrawn", label: "Retrase" },
];

export default async function AdminBikesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const [bikes, workshops] = await Promise.all([
    adminListBikes(db, (status || undefined) as BikeStatus | undefined),
    listActiveWorkshops(db),
  ]);

  return (
    <div>
      <section className="rounded-lg border border-border bg-card p-5 sm:p-6">
        <h2 className="font-heading text-lg font-semibold tracking-tight">Adaugă o bicicletă</h2>
        <div className="mt-4">
          <BikeCreateForm workshops={workshops} />
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-heading text-lg font-semibold tracking-tight">Stoc</h2>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <Link
                key={f.key}
                href={f.key ? `/admin/bikes?status=${f.key}` : "/admin/bikes"}
                className={`rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-wider transition-colors ${
                  (status ?? "") === f.key
                    ? "border-asphalt bg-asphalt text-paper"
                    : "border-border text-foreground/70 hover:border-asphalt/50"
                }`}
              >
                {f.label}
              </Link>
            ))}
          </div>
        </div>

        {bikes.length === 0 ? (
          <p className="mt-4 text-sm text-steel">Nicio bicicletă în acest filtru.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left font-mono text-xs uppercase tracking-wider text-steel">
                  <th className="py-2 pr-4">SKU</th>
                  <th className="py-2 pr-4">Bicicletă</th>
                  <th className="py-2 pr-4">Preț</th>
                  <th className="py-2 pr-4">Stare</th>
                  <th className="py-2 pr-4">Atelier</th>
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
                      <Link href={`/admin/bikes/${b.id}`} className="font-medium hover:underline">
                        {b.brand} {b.model}
                      </Link>
                      {b.photos.length > 0 ? (
                        <span className="ml-2 font-mono text-xs text-steel">📷 {b.photos.length}</span>
                      ) : (
                        <span className="ml-2 font-mono text-xs text-amber-600 dark:text-amber-400">fără poze</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 font-mono">{formatLei(b.priceCents)}</td>
                    <td className="py-3 pr-4">{statusLabel[b.status] ?? b.status}</td>
                    <td className="py-3 pr-4">
                      <WorkshopAssign bikeId={b.id} current={b.workshopId} workshops={workshops} />
                    </td>
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
  );
}
