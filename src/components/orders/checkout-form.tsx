"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrderAction } from "@/server/actions/orders";
import { COUNTIES } from "@/server/constants/counties";
import { fieldClass, labelClass, primaryBtn } from "@/components/auth/auth-shell";

type BillingType = "individual" | "company";
type Delivery = "pickup" | "courier";

function segmented<T extends string>(
  value: T,
  set: (v: T) => void,
  options: [T, string][]
) {
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

function CountySelect({ name, label }: { name: string; label: string }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <select name={name} required className={fieldClass} defaultValue="">
        <option value="" disabled>
          Alege județul
        </option>
        {COUNTIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CheckoutForm({ bikeId }: { bikeId: string }) {
  const router = useRouter();
  const [billingType, setBillingType] = useState<BillingType>("individual");
  const [delivery, setDelivery] = useState<Delivery>("pickup");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      bikeId,
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
    if (res.ok) {
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl; // hand off to Stripe checkout
        return;
      }
      router.push(`/account/orders/${res.orderId}`);
      return;
    }
    setLoading(false);
    setError(res.error);
  }

  return (
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
          <input name="billingName" placeholder="Nume complet" required className={fieldClass} />
          <input name="billingEmail" type="email" placeholder="E-mail" required className={fieldClass} />
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
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input name="deliveryStreet" placeholder="Stradă și număr" required className={`${fieldClass} sm:col-span-2`} />
            <input name="deliveryCity" placeholder="Oraș" required className={fieldClass} />
            <CountySelect name="deliveryCounty" label="" />
            <input name="deliveryPostalCode" placeholder="Cod poștal" required className={fieldClass} />
          </div>
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
        {loading ? "Se plasează comanda…" : "Plasează comanda"}
      </button>
    </form>
  );
}
