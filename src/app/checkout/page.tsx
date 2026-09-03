import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { CheckoutForm } from "@/components/orders/checkout-form";
import { getPaymentsLive, PAYMENTS_OFF_MESSAGE } from "@/server/services/settings";
import { db } from "@/server/db/client";
import { displayName } from "@/lib/user-display";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Finalizează comanda" };

export default async function CheckoutPage() {
  const session = await auth();
  // Basket lives in the browser; the buyer must be logged in to place the order.
  // The cart survives the round-trip, so we come back here after login.
  if (!session?.user?.id) redirect("/login?next=/checkout");
  const paymentsLive = await getPaymentsLive(db);

  return (
    <>
      <SiteHeader />
      <main id="continut" className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-14">
          <h1 className="text-3xl font-bold tracking-tight">Finalizează comanda</h1>
          <div className="mt-8">
            {paymentsLive ? (
              <CheckoutForm
                defaultName={displayName(session.user)}
                defaultEmail={session.user.email ?? undefined}
              />
            ) : (
              <div className="max-w-xl rounded-lg border border-amber-500/50 bg-amber-500/10 px-5 py-4 text-sm text-foreground">
                {PAYMENTS_OFF_MESSAGE} Bicicletele din coș rămân salvate.
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
