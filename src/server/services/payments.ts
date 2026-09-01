import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import type { DB } from "@/server/db/client";
import { bikes, orderItems, orders, reservations } from "@/server/db/schema";
import { getStripe, isPaymentEnabled } from "@/server/payments/stripe";
import { createRevolutOrder, retrieveRevolutOrder } from "@/server/payments/revolut";
import { sendEmail } from "@/server/email/send";
import { orderConfirmedTemplate } from "@/server/email/templates";
import { Conflict, NotFound } from "@/server/errors";
import type { PaymentProvider } from "@/server/services/settings";

function baseUrl(): string {
  if (process.env.AUTH_URL) return process.env.AUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3082";
}

/**
 * Best-effort live Stripe balance for the admin dashboard. Returns null if
 * payments are off or Stripe errors - it must never block the page.
 */
export async function getStripeSnapshot(): Promise<{
  mode: "test" | "live";
  availableCents: number;
  pendingCents: number;
} | null> {
  if (!isPaymentEnabled()) return null;
  try {
    const balance = await getStripe().balance.retrieve();
    const ron = (rows: { amount: number; currency: string }[]) =>
      rows.filter((b) => b.currency === "ron").reduce((s, b) => s + b.amount, 0);
    const mode = (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_live_") ? "live" : "test";
    return { mode, availableCents: ron(balance.available), pendingCents: ron(balance.pending) };
  } catch {
    return null;
  }
}

/** Load + validate a pending, unpaid order owned by the caller. */
async function loadPayableOrder(db: DB, orderId: string, userId: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order || order.userId !== userId) throw NotFound("Comanda nu există");
  if (order.paidAt) throw Conflict("Comanda este deja plătită");
  if (order.status !== "pending") throw Conflict("Comanda nu mai poate fi plătită");
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  if (items.length === 0) throw Conflict("Comanda nu are produse");
  return { order, items };
}

/** Route to the active provider's hosted checkout; returns the redirect URL. */
export async function startCheckout(
  db: DB,
  input: { orderId: string; userId: string; origin: string },
  provider: PaymentProvider
): Promise<string> {
  return provider === "revolut" ? createRevolutCheckout(db, input) : createCheckoutSession(db, input);
}

// --- Stripe ----------------------------------------------------------------

export async function createCheckoutSession(
  db: DB,
  input: { orderId: string; userId: string; origin: string }
): Promise<string> {
  const { order, items } = await loadPayableOrder(db, input.orderId, input.userId);

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: order.billingEmail,
    line_items: items.map((it) => ({
      quantity: 1,
      price_data: {
        currency: "ron",
        unit_amount: it.priceCents,
        product_data: { name: `${it.brand} ${it.model}`, description: `Serial ${it.sku}` },
      },
    })),
    metadata: { orderId: order.id },
    payment_intent_data: { metadata: { orderId: order.id } },
    expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
    success_url: `${input.origin}/account/orders/${order.id}?paid=1`,
    cancel_url: `${input.origin}/account/orders/${order.id}`,
  });

  await db.update(orders).set({ stripeSessionId: session.id }).where(eq(orders.id, order.id));
  if (!session.url) throw Conflict("Nu s-a putut deschide plata");
  return session.url;
}

/** Stripe webhook: checkout.session.completed. */
export async function handleCheckoutCompleted(db: DB, session: Stripe.Checkout.Session): Promise<void> {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;
  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : null;
  await completeOrder(db, orderId, { stripePaymentIntentId: paymentIntentId });
}

// --- Revolut ---------------------------------------------------------------

export async function createRevolutCheckout(
  db: DB,
  input: { orderId: string; userId: string; origin: string }
): Promise<string> {
  const { order } = await loadPayableOrder(db, input.orderId, input.userId);

  const ro = await createRevolutOrder({
    amountMinor: order.totalCents,
    currency: "RON",
    extRef: order.id,
    redirectUrl: `${input.origin}/account/orders/${order.id}?paid=1`,
    email: order.billingEmail,
  });

  await db.update(orders).set({ revolutOrderId: ro.id }).where(eq(orders.id, order.id));
  if (!ro.checkout_url) throw Conflict("Nu s-a putut deschide plata");
  return ro.checkout_url;
}

/** Revolut webhook: ORDER_COMPLETED (order_id is Revolut's). */
export async function handleRevolutCompleted(db: DB, revolutOrderId: string): Promise<void> {
  const [order] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.revolutOrderId, revolutOrderId))
    .limit(1);
  if (!order) return;
  await completeOrder(db, order.id, {});
}

// --- Shared ----------------------------------------------------------------

/**
 * Reconcile an order against its provider on the return page, so the UI is
 * correct immediately without waiting for the webhook. Best-effort; the webhook
 * is the reliable backstop, so this never throws.
 */
export async function reconcileOrderPayment(
  db: DB,
  input: { orderId: string; userId: string }
): Promise<void> {
  const [order] = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
  if (!order || order.userId !== input.userId || order.paidAt) return;

  try {
    if (order.revolutOrderId) {
      const ro = await retrieveRevolutOrder(order.revolutOrderId);
      if (ro.state === "completed") await handleRevolutCompleted(db, order.revolutOrderId);
    } else if (order.stripeSessionId) {
      const session = await getStripe().checkout.sessions.retrieve(order.stripeSessionId);
      if (session.payment_status === "paid") await handleCheckoutCompleted(db, session);
    }
  } catch {
    // Ignore: the webhook reconciles if this transient lookup failed.
  }
}

/**
 * Mark an order paid + confirmed, sell every bike in it, consume its holds, and
 * email the buyer. Provider-agnostic. Idempotent and race-safe (FOR UPDATE +
 * paidAt guard), so webhook + return-page reconcile can't double-run or
 * double-send the email.
 */
async function completeOrder(
  db: DB,
  orderId: string,
  extra: { stripePaymentIntentId?: string | null }
): Promise<void> {
  const processed = await db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).for("update").limit(1);
    if (!order || order.paidAt) return null; // unknown or already processed

    await tx
      .update(orders)
      .set({
        paidAt: new Date(),
        ...(extra.stripePaymentIntentId ? { stripePaymentIntentId: extra.stripePaymentIntentId } : {}),
        status: order.status === "pending" ? "confirmed" : order.status,
      })
      .where(eq(orders.id, orderId));

    const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    for (const it of items) {
      await tx.update(bikes).set({ status: "sold" }).where(eq(bikes.id, it.bikeId));
    }
    await tx
      .update(reservations)
      .set({ status: "converted" })
      .where(eq(reservations.orderId, orderId));

    return { order, items };
  });

  if (!processed) return;

  const { subject, html } = orderConfirmedTemplate({
    orderNumber: processed.order.orderNumber,
    items: processed.items.map((it) => ({
      brand: it.brand,
      model: it.model,
      sku: it.sku,
      priceCents: it.priceCents,
    })),
    totalCents: processed.order.totalCents,
    link: `${baseUrl()}/account/orders/${processed.order.id}`,
  });
  await sendEmail(db, { to: processed.order.billingEmail, subject, html, template: "order_confirmed" });
}
