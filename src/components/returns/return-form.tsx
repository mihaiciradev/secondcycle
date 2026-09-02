"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { submitReturnRequestAction } from "@/server/actions/returns";
import { fieldClass, labelClass, primaryBtn } from "@/components/auth/auth-shell";
import { formatLei } from "@/lib/money";

export type ReturnFormBike = {
  bikeId: string;
  sku: string;
  brand: string;
  model: string;
  priceCents: number;
  orderNumber: string;
};

export function ReturnForm({
  bikes,
  defaults,
  waNumber,
  supportEmail,
}: {
  bikes: ReturnFormBike[];
  defaults: { name: string; email: string; phone: string };
  waNumber: string;
  supportEmail: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(bikes.length === 1 ? [bikes[0].bikeId] : []);
  const [name, setName] = useState(defaults.name);
  const [email, setEmail] = useState(defaults.email);
  const [phone, setPhone] = useState(defaults.phone);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  const chosen = useMemo(() => bikes.filter((b) => selected.includes(b.bikeId)), [bikes, selected]);

  const message = useMemo(() => {
    const list = chosen.map((b) => `${b.brand} ${b.model} (${b.sku}, comanda ${b.orderNumber})`).join("; ");
    return (
      `Salut! Vreau să mă retrag din contract (retur) pentru: ${list || "bicicleta cumpărată"}.` +
      (reason.trim() ? ` Motiv: ${reason.trim()}.` : "")
    );
  }, [chosen, reason]);

  const wa = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
  const mailto = `mailto:${supportEmail}?subject=${encodeURIComponent("Cerere de retur")}&body=${encodeURIComponent(message)}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await submitReturnRequestAction({
      contactName: name.trim(),
      contactEmail: email.trim(),
      contactPhone: phone.trim() || undefined,
      bikeIds: selected,
      reason: reason.trim() || undefined,
    });
    setLoading(false);
    if (res.ok) {
      setDone(true);
      router.refresh();
    } else {
      setError(res.error);
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-6">
        <h3 className="font-heading text-lg font-semibold text-emerald-700 dark:text-emerald-400">
          Cererea a fost trimisă
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-foreground/80">
          Am înregistrat cererea ta de retur și am anunțat echipa. Te contactăm în cel mult 14 zile
          pentru rambursare. Poți trimite oricând o altă cerere de aici.
        </p>
        <button
          type="button"
          onClick={() => {
            setDone(false);
            setSelected([]);
            setReason("");
          }}
          className="mt-4 text-sm font-medium text-blue underline-offset-2 hover:underline"
        >
          Trimite altă cerere
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-border bg-card p-6 sm:p-8">
      <fieldset>
        <legend className="text-sm font-medium text-foreground/80">
          Pentru ce bicicletă(e) ceri retur?
        </legend>
        <ul className="mt-3 space-y-2">
          {bikes.map((b) => (
            <li key={b.bikeId}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-paper p-3.5 transition-colors hover:border-asphalt/40">
                <input
                  type="checkbox"
                  checked={selected.includes(b.bikeId)}
                  onChange={() => toggle(b.bikeId)}
                  className="size-4 accent-blue"
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">
                    {b.brand} {b.model}
                  </span>
                  <span className="block font-mono text-xs text-steel">
                    {b.sku} · {formatLei(b.priceCents)} · comanda {b.orderNumber}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Nume complet</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={fieldClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Telefon (opțional)</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={fieldClass} />
        </div>
      </div>

      <div className="mt-4">
        <label className={labelClass}>Motiv (opțional)</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className={`${fieldClass} resize-y`}
          placeholder="Nu ești obligat să dai un motiv."
        />
        <p className="mt-1 text-xs text-steel">
          Conform legii, nu trebuie să justifici retragerea. Câmpul e doar dacă vrei să ne spui.
        </p>
      </div>

      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

      <button type="submit" className={`${primaryBtn} mt-6`} disabled={loading || selected.length === 0}>
        {loading ? "Se trimite…" : "Trimite cererea de retur"}
      </button>

      <div className="mt-5 border-t border-border pt-5">
        <p className="text-sm text-steel">Preferi să trimiți direct? Folosește același text:</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#25D366] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#20bd5a]"
          >
            WhatsApp
          </a>
          <a
            href={mailto}
            className="inline-flex h-9 items-center rounded-full border border-asphalt/25 px-4 text-sm font-semibold text-foreground transition-colors hover:border-asphalt/50"
          >
            E-mail
          </a>
        </div>
      </div>
    </form>
  );
}
