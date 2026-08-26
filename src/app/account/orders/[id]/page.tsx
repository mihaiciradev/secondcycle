import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/server/db/client";
import { getOrderForUser } from "@/server/services/orders";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { formatLei } from "@/lib/money";
import { ORDER_STATUS_BADGE, ORDER_STATUS_LABEL } from "@/lib/order-status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2.5 last:border-b-0">
      <dt className="font-mono text-xs uppercase tracking-[0.1em] text-steel">{label}</dt>
      <dd className="text-right text-sm text-foreground/90">{value}</dd>
    </div>
  );
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;
  const row = await getOrderForUser(db, id, session.user.id);
  if (!row) notFound();
  const { order, bike } = row;

  const delivery =
    order.deliveryMethod === "courier"
      ? `Curier: ${[order.deliveryStreet, order.deliveryCity, order.deliveryCounty, order.deliveryPostalCode].filter(Boolean).join(", ")}`
      : "Ridicare personală de la atelier";

  return (
    <>
      <SiteHeader />
      <main id="continut" className="flex-1">
        <div className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
          <Link href="/account/orders" className="font-mono text-xs uppercase tracking-wider text-steel hover:text-foreground">
            ← Comenzile mele
          </Link>
          <div className="mt-5 flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold tracking-tight">{order.orderNumber}</h1>
            <span className={`rounded px-2 py-1 font-mono text-xs ${ORDER_STATUS_BADGE[order.status]}`}>
              {ORDER_STATUS_LABEL[order.status]}
            </span>
          </div>

          <div className="mt-8 space-y-4">
            <section className="rounded-lg border border-border bg-card p-5">
              <h2 className="font-heading text-base font-semibold tracking-tight">Bicicleta</h2>
              <dl className="mt-4">
                <Row label="Model" value={`${bike.brand} ${bike.model}`} />
                <Row label="Serial" value={bike.sku} />
                <Row label="Total" value={formatLei(order.totalCents)} />
              </dl>
            </section>

            <section className="rounded-lg border border-border bg-card p-5">
              <h2 className="font-heading text-base font-semibold tracking-tight">Facturare și livrare</h2>
              <dl className="mt-4">
                <Row label="Client" value={order.billingName} />
                {order.companyName ? <Row label="Firmă" value={order.companyName} /> : null}
                {order.companyCui ? <Row label="CUI" value={order.companyCui} /> : null}
                <Row
                  label="Adresă"
                  value={[order.billingStreet, order.billingCity, order.billingCounty, order.billingPostalCode]
                    .filter(Boolean)
                    .join(", ")}
                />
                <Row label="Livrare" value={delivery} />
              </dl>
            </section>

            <p className="text-sm text-steel">
              Comanda e înregistrată. Te contactăm pentru confirmare și pentru pasul de plată.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
