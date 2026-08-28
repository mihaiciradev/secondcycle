import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/server/db/client";
import { getUserOrders } from "@/server/services/orders";
import { formatLei } from "@/lib/money";
import { ORDER_STATUS_BADGE, ORDER_STATUS_LABEL } from "@/lib/order-status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function MyOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const rows = await getUserOrders(db, session.user.id);

  return (
    <div>
      <h2 className="font-heading text-lg font-semibold tracking-tight">Comenzile mele</h2>

      {rows.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-border p-10 text-center text-steel">
          Încă nu ai comenzi.{" "}
          <Link href="/bikes" className="text-blue underline-offset-2 hover:underline">
            Vezi bicicletele
          </Link>
          .
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {rows.map(({ order, items }) => (
            <li key={order.id}>
              <Link
                href={`/account/orders/${order.id}`}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-asphalt/40"
              >
                <div>
                  <p className="font-mono text-xs text-steel">{order.orderNumber}</p>
                  <p className="mt-1 font-medium">
                    {items[0] ? `${items[0].brand} ${items[0].model}` : "Comandă"}
                    {items.length > 1 ? (
                      <span className="text-steel"> +{items.length - 1}</span>
                    ) : null}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`rounded px-2 py-0.5 font-mono text-[0.65rem] ${ORDER_STATUS_BADGE[order.status]}`}>
                    {ORDER_STATUS_LABEL[order.status]}
                  </span>
                  <p className="mt-1 font-mono text-sm">{formatLei(order.totalCents)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
