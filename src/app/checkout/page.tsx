import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/server/db/client";
import { getActiveReservationForUser } from "@/server/services/reservations";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { CheckoutForm } from "@/components/orders/checkout-form";
import { formatLei } from "@/lib/money";
import { WARRANTY_MONTHS } from "@/server/constants/app";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Finalizează comanda" };

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const active = await getActiveReservationForUser(db, session.user.id);
  if (!active) redirect("/bikes");

  const { reservation, bike } = active;
  const expires = new Date(reservation.expiresAt).toLocaleTimeString("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <SiteHeader />
      <main id="continut" className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-14">
          <h1 className="text-3xl font-bold tracking-tight">Finalizează comanda</h1>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
            <CheckoutForm bikeId={bike.id} />

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-steel">Rezervarea ta</p>
                <h2 className="mt-3 font-heading text-lg font-semibold tracking-tight">
                  {bike.brand} {bike.model}
                </h2>
                <p className="font-mono text-xs text-steel">{bike.sku}</p>
                <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
                  <span className="text-sm text-foreground/70">Total</span>
                  <span className="font-heading text-xl font-bold tracking-tight">
                    {formatLei(bike.priceCents)}
                  </span>
                </div>
                <p className="mt-4 rounded border border-blue/25 bg-blue/5 px-3 py-2 text-xs text-blue">
                  Rezervarea e valabilă până la {expires}. Finalizează până atunci.
                </p>
                <p className="mt-3 text-xs text-steel">
                  Cu acte, verificare tehnică și garanție legală de conformitate ({WARRANTY_MONTHS} luni).
                  Plata se face separat, după confirmare.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
