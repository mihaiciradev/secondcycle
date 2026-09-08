import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/server/db/client";
import { cancelPendingOrder, getOrderForUser, getOrderHoldExpiry } from "@/server/services/orders";
import { reconcileOrderPayment } from "@/server/services/payments";
import { getPaymentsLive, PAYMENTS_OFF_MESSAGE } from "@/server/services/settings";
import { Card, Row } from "@/components/auth/account-ui";
import { PayButton } from "@/components/orders/pay-button";
import { CancelOrderButton } from "@/components/orders/cancel-order-button";
import { HoldCountdown } from "@/components/orders/hold-countdown";
import { formatLei } from "@/lib/money";
import { techSheetEntries } from "@/lib/tech-sheet";
import { ORDER_STATUS_BADGE, ORDER_STATUS_LABEL } from "@/lib/order-status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string; canceled?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;
  const { paid, canceled } = await searchParams;

  // Coming back from the payment provider: verify now so the page is correct
  // immediately, instead of waiting for the webhook. reconcile self-detects the
  // provider from the order and no-ops if there's nothing to reconcile.
  if (paid) {
    await reconcileOrderPayment(db, { orderId: id, userId: session.user.id });
  }
  // Returned from a cancelled checkout (Stripe cancel_url): free the bike right
  // away instead of leaving it locked until the hold expires. No-op if paid.
  if (canceled) {
    await cancelPendingOrder(db, id, session.user.id);
  }

  const row = await getOrderForUser(db, id, session.user.id);
  if (!row) notFound();
  const { order, items } = row;
  // Don't show "Pay" while we're on the return-from-Stripe screen (`paid`),
  // even in the rare case reconciliation is still catching up.
  const unpaidPending = order.status === "pending" && !order.paidAt && !paid;
  const paymentsLive = unpaidPending ? await getPaymentsLive(db) : false;
  const awaitingPayment = unpaidPending && paymentsLive;
  const paymentsOff = unpaidPending && !paymentsLive;
  const holdExpiry = awaitingPayment ? await getOrderHoldExpiry(db, order.id) : null;

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
        <div className="mt-4 flex items-center gap-3 rounded-lg bg-emerald-600 px-4 py-3 text-paper shadow-sm">
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-5 shrink-0" aria-hidden>
            <path
              fillRule="evenodd"
              d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.3 3.29 6.8-6.79a1 1 0 0 1 1.4 0Z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm font-medium">Plată confirmată. Mulțumim! Îți pregătim bicicleta.</p>
        </div>
      ) : paid ? (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <span className="size-4 shrink-0 animate-spin rounded-full border-2 border-steel/30 border-t-steel" aria-hidden />
          <p className="text-sm text-foreground/80">Verificăm plata cu Stripe. Reîncarcă pagina în câteva secunde.</p>
        </div>
      ) : null}

      <div className="mt-6 space-y-4">
        <Card title={items.length > 1 ? `Biciclete (${items.length})` : "Bicicleta"}>
          <dl>
            {items.map((it) => (
              <Row key={it.id} label={`${it.brand} ${it.model}`}>
                <span className="font-mono text-xs text-steel">{it.sku}</span>
                {"  "}
                {formatLei(it.priceCents)}
              </Row>
            ))}
            <Row label="Livrare">
              {order.deliveryFeeCents > 0 ? formatLei(order.deliveryFeeCents) : "Gratuit"}
            </Row>
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
              Plătită pe{" "}
              {new Date(order.paidAt).toLocaleString("ro-RO", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              .
            </p>
          ) : awaitingPayment ? (
            <div>
              <p className="mb-2 text-sm text-foreground/70">
                Comanda așteaptă plata. Finalizează plata în siguranță.
              </p>
              {holdExpiry ? (
                <div className="mb-4">
                  <HoldCountdown expiresAt={holdExpiry.toISOString()} />
                </div>
              ) : null}
              <PayButton orderId={order.id} />
              <CancelOrderButton orderId={order.id} />
            </div>
          ) : paymentsOff ? (
            <p className="rounded-md border border-amber-500/50 bg-amber-500/10 px-3.5 py-2.5 text-sm text-foreground">
              {PAYMENTS_OFF_MESSAGE}
            </p>
          ) : (
            <p className="text-sm text-steel">
              Comanda e înregistrată. Te contactăm pentru confirmare și livrare.
            </p>
          )}
        </Card>

        {order.paidAt ? (
          <>
            <Card title="Certificat de garanție">
              <div className="space-y-4">
                {items.map((it) => {
                  const entries = techSheetEntries(it.techSheetSnapshot);
                  return (
                    <div key={it.id} className="rounded-lg border border-border p-4">
                      <p className="font-medium">
                        {it.brand} {it.model}{" "}
                        <span className="font-mono text-xs text-steel">{it.sku}</span>
                      </p>
                      <p className="mt-1 text-sm text-foreground/80">
                        Garanție legală de conformitate:{" "}
                        <strong>{it.warrantyMonths ?? 12} luni</strong> (produs second-hand).
                      </p>
                      {entries.length > 0 ? (
                        <details className="mt-2 text-sm">
                          <summary className="cursor-pointer text-blue underline-offset-2 hover:underline">
                            Fișa tehnică (la momentul cumpărării)
                          </summary>
                          <dl className="mt-2 space-y-1.5 border-l-2 border-border pl-3">
                            {entries.map((e) => (
                              <div key={e.key}>
                                <dt className="font-mono text-[0.65rem] uppercase tracking-wider text-steel">
                                  {e.label}
                                </dt>
                                <dd className="whitespace-pre-line text-foreground/85">{e.value}</dd>
                              </div>
                            ))}
                          </dl>
                        </details>
                      ) : null}
                      {it.consentAcceptedAt ? (
                        <p className="mt-2 text-xs text-steel">
                          Stare acceptată la{" "}
                          {new Date(it.consentAcceptedAt).toLocaleString("ro-RO")}.
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card title="Drept de retragere (14 zile)">
              <p className="text-sm leading-relaxed text-foreground/80">
                Te poți retrage din contract în 14 zile de la primirea bicicletei, fără să dai un
                motiv. Deschide formularul de retragere pentru comanda ta.
              </p>
              <Link
                href="/retur"
                className="mt-4 inline-flex h-10 items-center rounded-full bg-asphalt px-5 text-sm font-semibold text-paper transition-colors hover:bg-asphalt/90"
              >
                Formular de retragere
              </Link>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  );
}
