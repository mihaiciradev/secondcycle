import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/server/db/client";
import { getOrderForUser } from "@/server/services/orders";
import { Card, Row } from "@/components/auth/account-ui";
import { formatLei } from "@/lib/money";
import { ORDER_STATUS_BADGE, ORDER_STATUS_LABEL } from "@/lib/order-status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;
  const row = await getOrderForUser(db, id, session.user.id);
  if (!row) notFound();
  const { order, bike } = row;

  const delivery =
    order.deliveryMethod === "courier"
      ? `Curier: ${[order.deliveryStreet, order.deliveryCity, order.deliveryCounty, order.deliveryPostalCode].filter(Boolean).join(", ")}`
      : "Ridicare personală de la atelier";

  return (
    <div>
      <Link
        href="/account/orders"
        className="font-mono text-xs uppercase tracking-wider text-steel hover:text-foreground"
      >
        ← Comenzile mele
      </Link>
      <div className="mt-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold tracking-tight">{order.orderNumber}</h2>
        <span className={`rounded px-2 py-1 font-mono text-xs ${ORDER_STATUS_BADGE[order.status]}`}>
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </div>

      <div className="mt-6 space-y-4">
        <Card title="Bicicleta">
          <dl>
            <Row label="Model">{`${bike.brand} ${bike.model}`}</Row>
            <Row label="Serial">{bike.sku}</Row>
            <Row label="Total">{formatLei(order.totalCents)}</Row>
          </dl>
        </Card>

        <Card title="Facturare și livrare">
          <dl>
            <Row label="Client">{order.billingName}</Row>
            {order.companyName ? <Row label="Firmă">{order.companyName}</Row> : null}
            {order.companyCui ? <Row label="CUI">{order.companyCui}</Row> : null}
            <Row label="Adresă">
              {[order.billingStreet, order.billingCity, order.billingCounty, order.billingPostalCode]
                .filter(Boolean)
                .join(", ")}
            </Row>
            <Row label="Livrare">{delivery}</Row>
          </dl>
        </Card>

        <p className="text-sm text-steel">
          Comanda e înregistrată. Te contactăm pentru confirmare și pentru pasul de plată.
        </p>
      </div>
    </div>
  );
}
