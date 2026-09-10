"use client";

import { useState } from "react";
import { submitValuationAction } from "@/server/actions/valuations";
import { fieldClass, primaryBtn } from "@/components/auth/auth-shell";

type Defaults = {
  name: string;
  marketLei: string;
  suggestedLei: string;
  notWorth: boolean;
  notes: string;
};

function leiToCents(v: string): number | null {
  const n = Number(v.replace(",", "."));
  if (!v.trim() || Number.isNaN(n)) return null;
  return Math.round(n * 100);
}

export function ValuationForm({
  token,
  defaults,
  alreadySubmitted,
}: {
  token: string;
  defaults: Defaults;
  alreadySubmitted: boolean;
}) {
  const [name, setName] = useState(defaults.name);
  const [market, setMarket] = useState(defaults.marketLei);
  const [suggested, setSuggested] = useState(defaults.suggestedLei);
  const [notWorth, setNotWorth] = useState(defaults.notWorth);
  const [notes, setNotes] = useState(defaults.notes);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await submitValuationAction({
      token,
      respondentName: name.trim(),
      marketValueCents: notWorth ? null : leiToCents(market),
      suggestedSpendCents: notWorth ? null : leiToCents(suggested),
      notWorth,
      notes: notes.trim() || null,
    });
    setLoading(false);
    if (res.ok) {
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setError(res.error);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/[0.06] p-6">
        <h2 className="font-heading text-xl font-semibold text-emerald-700 dark:text-emerald-400">
          Mulțumim! Am primit părerea ta.
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-foreground/80">
          Răspunsul a ajuns la echipa Second Cycle. Poți închide pagina. Dacă vrei să corectezi ceva,
          reîncarcă pagina și trimite din nou.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="vf-name" className="block text-sm font-medium text-foreground">
          Cine ești? <span className="text-destructive">*</span>
        </label>
        <input
          id="vf-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Numele tău sau al atelierului"
          required
          className={`${fieldClass} mt-1.5 w-full`}
        />
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-4">
        <input
          type="checkbox"
          checked={notWorth}
          onChange={(e) => setNotWorth(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-asphalt"
        />
        <span>
          <span className="text-sm font-medium text-foreground">
            Bicicleta e prea proastă să merite reparația/vânzarea
          </span>
          <span className="mt-0.5 block text-xs text-steel">
            Bifează dacă părerea ta e că nu are rost s-o luăm. Atunci prețurile de mai jos nu mai sunt
            necesare.
          </span>
        </span>
      </label>

      {!notWorth ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="vf-market" className="block text-sm font-medium text-foreground">
              Cât face pe piață? <span className="text-destructive">*</span>
            </label>
            <p className="mt-0.5 text-xs text-steel">Prețul realist de vânzare, în lei.</p>
            <div className="relative mt-1.5">
              <input
                id="vf-market"
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={market}
                onChange={(e) => setMarket(e.target.value)}
                placeholder="ex. 1500"
                className={`${fieldClass} w-full pr-10`}
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-steel">
                lei
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="vf-suggested" className="block text-sm font-medium text-foreground">
              Cât ai da tu pe ea?
            </label>
            <p className="mt-0.5 text-xs text-steel">Cât ai sugera să investim, în lei (opțional).</p>
            <div className="relative mt-1.5">
              <input
                id="vf-suggested"
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={suggested}
                onChange={(e) => setSuggested(e.target.value)}
                placeholder="ex. 900"
                className={`${fieldClass} w-full pr-10`}
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-steel">
                lei
              </span>
            </div>
          </div>
        </div>
      ) : null}

      <div>
        <label htmlFor="vf-notes" className="block text-sm font-medium text-foreground">
          Observații (opțional)
        </label>
        <textarea
          id="vf-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Orice ne ajută: ce ai văzut, ce ar trebui schimbat, riscuri…"
          className={`${fieldClass} mt-1.5 w-full resize-y`}
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <button type="submit" className={primaryBtn} disabled={loading}>
        {loading ? "Se trimite…" : alreadySubmitted ? "Actualizează părerea" : "Trimite părerea"}
      </button>
    </form>
  );
}
