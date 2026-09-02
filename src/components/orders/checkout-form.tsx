"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createOrderAction } from "@/server/actions/orders";
import { useCart } from "@/components/cart/use-cart";
import { COUNTIES } from "@/server/constants/counties";
import { fieldClass, labelClass, primaryBtn } from "@/components/auth/auth-shell";
import { formatLei } from "@/lib/money";
import { deliveryFeeCents } from "@/lib/delivery";
import { WARRANTY_MONTHS } from "@/server/constants/app";

type BillingType = "individual" | "company";
type Delivery = "pickup" | "courier";

function segmented<T extends string>(value: T, set: (v: T) => void, options: [T, string][]) {
  return (
    <div className="inline-flex rounded-full border border-border p-1">
      {options.map(([v, label]) => (
        <button
          key={v}
          type="button"
          onClick={() => set(v)}
          className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            value === v ? "bg-asphalt text-paper" : "text-foreground/70 hover:text-foreground"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function CheckoutForm({
  defaultName,
  defaultEmail,
}: {
  defaultName?: string;
  defaultEmail?: string;
}) {
  const router = useRouter();
  const { items, remove, clear, count } = useCart();
  const total = items.reduce((sum, it) => sum + it.priceCents, 0);

  const [billingType, setBillingType] = useState<BillingType>("individual");
  const [delivery, setDelivery] = useState<Delivery>("pickup");
  const [deliveryCounty, setDeliveryCounty] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [terms, setTerms] = useState(false);

  const feeKnown = delivery === "pickup" || (Boolean(deliveryCounty) && Boolean(deliveryCity));
  const fee = feeKnown ? deliveryFeeCents(delivery, deliveryCounty, deliveryCity) : 0;
  const grandTotal = total + fee;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<{ url: string; gone: string[] } | null>(null);

  if (count === 0 && !pending) {
    return (
      <div className="rounded-lg border border-dashed border-border p-12 text-center text-steel">
        Coșul e gol.{" "}
        <Link href="/bikes" className="text-blue underline-offset-2 hover:underline">
          Vezi bicicletele
        </Link>
        .
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!terms) {
      setError("Trebuie să accepți termenii și condițiile.");
      return;
    }
    setLoading(true);
    setError(null);
    const f = new FormData(e.currentTarget);
    const s = (k: string) => {
      const v = f.get(k);
      return v ? String(v).trim() : undefined;
    };
    const input = {
      bikeIds: items.map((it) => it.bikeId),
      billingType,
      billingName: s("billingName") ?? "",
      billingEmail: s("billingEmail") ?? "",
      billingPhone: s("billingPhone") ?? "",
      billingStreet: s("billingStreet") ?? "",
      billingCity: s("billingCity") ?? "",
      billingCounty: s("billingCounty") ?? "",
      billingPostalCode: s("billingPostalCode") ?? "",
      companyName: billingType === "company" ? s("companyName") : undefined,
      companyCui: billingType === "company" ? s("companyCui") : undefined,
      companyRegCom: billingType === "company" ? s("companyRegCom") : undefined,
      deliveryMethod: delivery,
      deliveryStreet: delivery === "courier" ? s("deliveryStreet") : undefined,
      deliveryCity: delivery === "courier" ? s("deliveryCity") : undefined,
      deliveryCounty: delivery === "courier" ? s("deliveryCounty") : undefined,
      deliveryPostalCode: delivery === "courier" ? s("deliveryPostalCode") : undefined,
      customerNote: s("customerNote"),
      termsAccepted: true as const,
    };
    const res = await createOrderAction(input);
    if (!res.ok) {
      setLoading(false);
      setError(res.error);
      return;
    }

    const goneLabels = res.unavailable.map((u) => u.label ?? "o bicicletă");
    // Bikes that made it into the order can leave the basket; ones that were
    // already taken stay so the buyer sees what happened.
    const goneIds = new Set(res.unavailable.map((u) => u.bikeId));
    for (const it of items) if (!goneIds.has(it.bikeId)) remove(it.bikeId);

    if (!res.checkoutUrl) {
      clear();
      router.push(`/account/orders/${res.orderId}`);
      return;
    }
    // If everything was available, go straight to Stripe. If some items were
    // taken meanwhile, pause on a notice so the buyer isn't surprised.
    if (goneLabels.length === 0) {
      window.location.href = res.checkoutUrl;
      return;
    }
    setLoading(false);
    setPending({ url: res.checkoutUrl, gone: goneLabels });
  }

  if (pending) {
    return (
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-6">
        <h2 className="font-heading text-lg font-semibold">Unele biciclete tocmai au fost rezervate</h2>
        <p className="mt-2 text-sm text-foreground/80">
          Între timp au fost luate: <strong>{pending.gone.join(", ")}</strong>. Restul comenzii e pregătit
          și blocat pentru tine 30 de minute.
        </p>
        <button
          type="button"
          onClick={() => (window.location.href = pending.url)}
          className={primaryBtn + " mt-5"}
        >
          Continuă la plată
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <form onSubmit={onSubmit} className="space-y-8">
        <section>
          <h2 className="font-heading text-lg font-semibold tracking-tight">Facturare</h2>
          <div className="mt-4">
            {segmented(billingType, setBillingType, [
              ["individual", "Persoană fizică"],
              ["company", "Firmă"],
            ])}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input name="billingName" placeholder="Nume complet" defaultValue={defaultName} required className={fieldClass} />
            <input name="billingEmail" type="email" placeholder="E-mail" defaultValue={defaultEmail} required className={fieldClass} />
            <input name="billingPhone" placeholder="Telefon" required className={fieldClass} />
            <input name="billingStreet" placeholder="Stradă și număr" required className={`${fieldClass} sm:col-span-2`} />
            <input name="billingCity" placeholder="Oraș" required className={fieldClass} />
            <select name="billingCounty" required className={fieldClass} defaultValue="">
              <option value="" disabled>
                Județ
              </option>
              {COUNTIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input name="billingPostalCode" placeholder="Cod poștal" required className={fieldClass} />
          </div>

          {billingType === "company" ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input name="companyName" placeholder="Denumire firmă" required className={`${fieldClass} sm:col-span-2`} />
              <input name="companyCui" placeholder="CUI (ex. RO12345678)" required className={fieldClass} />
              <input name="companyRegCom" placeholder="Nr. Reg. Com. (J.../.../...)" required className={fieldClass} />
            </div>
          ) : null}
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold tracking-tight">Livrare</h2>
          <div className="mt-4">
            {segmented(delivery, setDelivery, [
              ["pickup", "Ridicare personală"],
              ["courier", "Curier"],
            ])}
          </div>
          {delivery === "courier" ? (
            <>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input name="deliveryStreet" placeholder="Stradă și număr" required className={`${fieldClass} sm:col-span-2`} />
                <input
                  name="deliveryCity"
                  placeholder="Oraș"
                  required
                  value={deliveryCity}
                  onChange={(e) => setDeliveryCity(e.target.value)}
                  className={fieldClass}
                />
                <select
                  name="deliveryCounty"
                  required
                  value={deliveryCounty}
                  onChange={(e) => setDeliveryCounty(e.target.value)}
                  className={fieldClass}
                >
                  <option value="" disabled>
                    Județ
                  </option>
                  {COUNTIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input name="deliveryPostalCode" placeholder="Cod poștal" required className={fieldClass} />
              </div>
              <p className="mt-2 text-xs text-steel">
                Livrare doar în România. Timișoara și împrejurimi 30 lei · restul județului Timiș 80
                lei · restul țării 130 lei.
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-steel">Ridici bicicleta de la atelier, cu proces-verbal de predare.</p>
          )}
        </section>

        <section>
          <textarea name="customerNote" placeholder="Observații (opțional)" rows={2} className={fieldClass} />
        </section>

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            className="mt-0.5 size-4 accent-[color:var(--color-blue)]"
          />
          <span className="text-foreground/80">
            Am citit și accept{" "}
            <a href="/terms" target="_blank" className="text-blue underline underline-offset-2">
              termenii și condițiile
            </a>{" "}
            și{" "}
            <a href="/privacy" target="_blank" className="text-blue underline underline-offset-2">
              politica de confidențialitate
            </a>
            .
          </span>
        </label>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <button type="submit" className={primaryBtn} disabled={loading}>
          {loading ? "Se pregătește plata…" : "Mergi la plată"}
        </button>
      </form>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-steel">Comanda ta</p>
          <ul className="mt-3 space-y-2.5">
            {items.map((it) => (
              <li key={it.bikeId} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0">
                  <span className="font-medium">{it.brand} {it.model}</span>{" "}
                  <span className="font-mono text-xs text-steel">{it.sku}</span>
                </span>
                <span className="font-mono">{formatLei(it.priceCents)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3 text-sm">
            <span className="text-foreground/70">Produse</span>
            <span className="font-mono">{formatLei(total)}</span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between text-sm">
            <span className="text-foreground/70">
              Livrare {delivery === "pickup" ? "(ridicare)" : "(curier)"}
            </span>
            <span className="font-mono">
              {delivery === "pickup" ? "Gratuit" : feeKnown ? formatLei(fee) : "Se calculează"}
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
            <span className="text-sm text-foreground/70">Total</span>
            <span className="font-heading text-xl font-bold tracking-tight">{formatLei(grandTotal)}</span>
          </div>
          <p className="mt-4 rounded border border-blue/25 bg-blue/5 px-3 py-2 text-xs text-blue">
            Când mergi la plată, {count === 1 ? "bicicleta se blochează" : "bicicletele se blochează"} pentru
            tine 30 de minute. Dacă nu finalizezi, {count === 1 ? "revine" : "revin"} în stoc.
          </p>
          <p className="mt-3 text-xs text-steel">
            Cu acte, verificare tehnică și garanție legală de conformitate ({WARRANTY_MONTHS} luni).
          </p>
        </div>
      </aside>
    </div>
  );
}
