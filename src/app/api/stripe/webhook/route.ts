export const runtime = "nodejs";

import { db } from "@/server/db/client";
import { getStripe } from "@/server/payments/stripe";
import { handleCheckoutCompleted } from "@/server/services/payments";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !process.env.STRIPE_SECRET_KEY) {
    return new Response("Payments not configured", { status: 503 });
  }
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const payload = await request.text(); // raw body - required for signature check
  let event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    await handleCheckoutCompleted(db, event.data.object);
  }

  return Response.json({ received: true });
}
