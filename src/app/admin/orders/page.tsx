import Link from "next/link";
import { db } from "@/server/db/client";
import { adminListOrders } from "@/server/services/orders";
import { OrderRowActions } from "@/components/admin/order-row-actions";
import { formatLei } from "@/lib/money";
import { ORDER_STATUS_BADGE, ORDER_STATUS_LABEL } from "@/lib/order-status";
import type { OrderStatus } from "@/server/constants/statuses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FILTERS: { key: string; label: string }[] = [
  { key: "", label: "Toate" },
  { key: "pending", label: "În așteptare" },
  { key: "confirmed", label: "Confirmate" },
  { key: "completed", label: "Finalizate" },
  { key: "cancelled", label: "Anulate" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const rows = await adminListOrders(db, (status || undefined) as OrderStatus | undefined);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key ? `/admin/orders?status=${f.key}` : "/admin/orders"}
            className={`rounded-full border px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
              (status ?? "") === f.key
                ? "border-asphalt bg-asphalt text-paper"
                : "border-border text-foreground/75 hover:border-asphalt/50"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-steel">Nicio comandă.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left font-mono text-xs uppercase tracking-wider text-steel">
                <th className="py-2 pr-4">Comandă</th>
                <th className="py-2 pr-4">Bicicletă</th>
                <th className="py-2 pr-4">Client</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2 pr-4">Stare</th>
                <th className="py-2">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ order, bike }) => (
                <tr key={order.id} className="border-b border-border/70">
                  <td className="py-3 pr-4 font-mono text-xs">{order.orderNumber}</td>
                  <td className="py-3 pr-4">
                    {bike.brand} {bike.model}
                  </td>
                  <td className="py-3 pr-4 text-foreground/80">{order.billingEmail}</td>
                  <td className="py-3 pr-4 font-mono">{formatLei(order.totalCents)}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded px-2 py-0.5 font-mono text-[0.65rem] ${ORDER_STATUS_BADGE[order.status]}`}>
                      {ORDER_STATUS_LABEL[order.status]}
                    </span>
                  </td>
                  <td className="py-3">
                    <OrderRowActions id={order.id} status={order.status as OrderStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
