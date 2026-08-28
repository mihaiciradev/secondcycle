import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import type { DB } from "@/server/db/client";
import { bikes, orderItems, orders, reservations } from "@/server/db/schema";
import { getStripe } from "@/server/payments/stripe";
import { Conflict, NotFound } from "@/server/errors";

/**
 * Create a Stripe Checkout Session for a pending order owned by the caller. One
 * line item per bike in the order (amounts snapshotted in bani). Returns the
 * hosted checkout URL. The order is only marked paid by the webhook / return
 * reconciliation, never here.
 */
export async function createCheckoutSession(
  db: DB,
  input: { orderId: string; userId: string; origin: string }
): Promise<string> {
  const [order] = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
  if (!order || order.userId !== input.userId) throw NotFound("Comanda nu există");
  if (order.paidAt) throw Conflict("Comanda este deja plătită");
  if (order.status !== "pending") throw Conflict("Comanda nu mai poate fi plătită");

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  if (items.length === 0) throw Conflict("Comanda nu are produse");

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
    // Roughly aligned with our 30-minute hold; a small buffer over Stripe's
    // 30-minute minimum so session creation never races the clock.
    expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
    success_url: `${input.origin}/account/orders/${order.id}?paid=1`,
    cancel_url: `${input.origin}/account/orders/${order.id}`,
  });

  await db.update(orders).set({ stripeSessionId: session.id }).where(eq(orders.id, order.id));
  if (!session.url) throw Conflict("Nu s-a putut deschide plata");
  return session.url;
}

/**
 * Synchronously reconcile an order against Stripe (used on the checkout return
 * page so the UI is correct immediately, without waiting for the webhook).
 * Never throws on Stripe errors — the webhook remains the reliable backstop.
 */
export async function reconcileOrderPayment(
  db: DB,
  input: { orderId: string; userId: string }
): Promise<void> {
  const [order] = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
  if (!order || order.userId !== input.userId) return;
  if (order.paidAt || !order.stripeSessionId) return;

  try {
    const session = await getStripe().checkout.sessions.retrieve(order.stripeSessionId);
    if (session.payment_status === "paid") {
      await handleCheckoutCompleted(db, session);
    }
  } catch {
    // Ignore: the webhook will reconcile if this transient lookup failed.
  }
}

/**
 * Handle checkout.session.completed: mark the order paid + confirmed, sell every
 * bike in it, and consume its holds. Idempotent and race-safe (FOR UPDATE +
 * paidAt guard), so the webhook and the return-page reconcile can't double-run.
 */
export async function handleCheckoutCompleted(
  db: DB,
  session: Stripe.Checkout.Session
): Promise<void> {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  await db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).for("update").limit(1);
    if (!order || order.paidAt) return; // unknown or already processed

    const paymentIntentId =
      typeof session.payment_intent === "string" ? session.payment_intent : null;

    await tx
      .update(orders)
      .set({
        paidAt: new Date(),
        stripePaymentIntentId: paymentIntentId,
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
  });
}
