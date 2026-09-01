export const runtime = "nodejs";

import { db } from "@/server/db/client";
import { revolutWebhookSecret, verifyRevolutWebhook } from "@/server/payments/revolut";
import { handleRevolutCompleted } from "@/server/services/payments";

export async function POST(request: Request) {
  const secret = revolutWebhookSecret();
  if (!secret) return new Response("Payments not configured", { status: 503 });

  const payload = await request.text(); // raw body, required for signature check
  const ok = verifyRevolutWebhook({
    rawBody: payload,
    signatureHeader: request.headers.get("revolut-signature"),
    timestampHeader: request.headers.get("revolut-request-timestamp"),
    secret,
  });
  if (!ok) return new Response("Invalid signature", { status: 400 });

  let event: { event?: string; order_id?: string };
  try {
    event = JSON.parse(payload);
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  if (event.event === "ORDER_COMPLETED" && event.order_id) {
    await handleRevolutCompleted(db, event.order_id);
  }

  return Response.json({ received: true });
}
