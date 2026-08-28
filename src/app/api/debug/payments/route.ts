export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TEMPORARY diagnostic. Reveals only booleans + the key MODE (never the secret
 * value). Refuses to answer in production so it can't leak config on the live
 * site. Delete this route once payments are verified on preprod.
 */
export async function GET() {
  if (process.env.VERCEL_ENV === "production") {
    return new Response("Not available", { status: 404 });
  }

  const secret = process.env.STRIPE_SECRET_KEY ?? "";
  const keyMode = secret.startsWith("sk_live_")
    ? "live"
    : secret.startsWith("sk_test_")
      ? "test"
      : secret
        ? "unknown"
        : "none";

  return Response.json({
    vercelEnv: process.env.VERCEL_ENV ?? "local",
    paymentEnabled: Boolean(secret),
    keyMode,
    hasPublishableKey: Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
    hasWebhookSecret: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
  });
}
