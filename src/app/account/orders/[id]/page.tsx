import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/server/db/client";
import { getOrderForUser } from "@/server/services/orders";
import { reconcileOrderPayment } from "@/server/services/payments";
import { Card, Row } from "@/components/auth/account-ui";
import { PayButton } from "@/components/orders/pay-button";
import { isPaymentEnabled } from "@/server/payments/stripe";
import { formatLei } from "@/lib/money";
import { ORDER_STATUS_BADGE, ORDER_STATUS_LABEL } from "@/lib/order-status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;
  const { paid } = await searchParams;

  // Coming back from Stripe: verify the payment now so the page is correct
  // immediately, instead of waiting for the webhook to arrive.
  if (paid && isPaymentEnabled()) {
    await reconcileOrderPayment(db, { orderId: id, userId: session.user.id });
  }

  const row = await getOrderForUser(db, id, session.user.id);
  if (!row) notFound();
  const { order, bike } = row;
  // Don't show "Pay" while we're on the return-from-Stripe screen (`paid`),
  // even in the rare case reconciliation is still catching up.
  const awaitingPayment =
    order.status === "pending" && !order.paidAt && isPaymentEnabled() && !paid;

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

      {paid && order.paidAt ? (
        <p className="mt-4 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
          Plată confirmată. Mulțumim! Îți pregătim bicicleta.
        </p>
      ) : paid ? (
        <p className="mt-4 rounded-md border border-amber-500/25 bg-amber-500/10 px-3.5 py-2.5 text-sm text-amber-700 dark:text-amber-400">
          Verificăm plata cu Stripe. Reîncarcă pagina în câteva secunde.
        </p>
      ) : null}

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

        <Card title="Plată">
          {order.paidAt ? (
            <p className="text-sm text-foreground/80">
              Plătită pe {new Date(order.paidAt).toLocaleDateString("ro-RO")}.
            </p>
          ) : awaitingPayment ? (
            <div>
              <p className="mb-4 text-sm text-foreground/70">
                Comanda așteaptă plata. Finalizează plata în siguranță prin Stripe.
              </p>
              <PayButton orderId={order.id} />
            </div>
          ) : (
            <p className="text-sm text-steel">
              Comanda e înregistrată. Te contactăm pentru confirmare și livrare.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
