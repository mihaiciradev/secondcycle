import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import type { DB } from "@/server/db/client";
import { bikes, orders } from "@/server/db/schema";
import { getStripe } from "@/server/payments/stripe";
import { Conflict, NotFound } from "@/server/errors";

/**
 * Create a Stripe Checkout Session for a pending order owned by the caller.
 * Amount is the snapshotted total in bani (RON minor unit). Returns the hosted
 * checkout URL. The order is only marked paid by the webhook, never here.
 */
export async function createCheckoutSession(
  db: DB,
  input: { orderId: string; userId: string; origin: string }
): Promise<string> {
  const [row] = await db
    .select({ order: orders, bike: bikes })
    .from(orders)
    .innerJoin(bikes, eq(bikes.id, orders.bikeId))
    .where(eq(orders.id, input.orderId))
    .limit(1);
  if (!row || row.order.userId !== input.userId) throw NotFound("Comanda nu există");

  const { order, bike } = row;
  if (order.paidAt) throw Conflict("Comanda este deja plătită");
  if (order.status !== "pending") throw Conflict("Comanda nu mai poate fi plătită");

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: order.billingEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "ron",
          unit_amount: order.totalCents,
          product_data: {
            name: `${bike.brand} ${bike.model}`,
            description: `Serial ${bike.sku}`,
          },
        },
      },
    ],
    metadata: { orderId: order.id },
    payment_intent_data: { metadata: { orderId: order.id } },
    success_url: `${input.origin}/account/orders/${order.id}?paid=1`,
    cancel_url: `${input.origin}/account/orders/${order.id}`,
  });

  await db.update(orders).set({ stripeSessionId: session.id }).where(eq(orders.id, order.id));
  if (!session.url) throw Conflict("Nu s-a putut deschide plata");
  return session.url;
}

/**
 * Handle checkout.session.completed from the webhook: mark the order paid,
 * confirm it, and sell the bike. Idempotent and race-safe (FOR UPDATE + guard).
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

    if (order.status === "pending") {
      await tx.update(bikes).set({ status: "sold" }).where(eq(bikes.id, order.bikeId));
    }
  });
}
