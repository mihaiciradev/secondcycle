"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveBikeSaleAction } from "@/server/actions/admin/bikes";
import { fieldClass, labelClass } from "@/components/auth/auth-shell";
import { formatLei } from "@/lib/money";

const centsToLei = (c?: number | null) => (c != null ? String(c / 100) : "");
const leiToCents = (v: FormDataEntryValue | null): number | null => {
  if (!v) return null;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
};

export function BikeSaleForm({
  bike,
  hasIntake,
}: {
  bike: {
    id: string;
    status: string;
    priceCents: number;
    provisionalPriceCents: number | null;
    acquisitionCostCents: number | null;
    description: string;
    workDone: string[];
  };
  hasIntake: boolean;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<null | "save" | "publish">(null);

  const locked = bike.status === "sold" || bike.status === "reserved";
  const isDraft = bike.status === "draft";

  async function submit(publish: boolean) {
    const form = formRef.current;
    if (!form) return;
    setLoading(publish ? "publish" : "save");
    setError(null);
    const f = new FormData(form);
    const input = {
      bikeId: bike.id,
      // When locked the price input is disabled (omitted from FormData); fall
      // back to the current price so validation passes. The server ignores it.
      priceCents: leiToCents(f.get("priceLei")) ?? bike.priceCents,
      acquisitionCostCents: locked
        ? bike.acquisitionCostCents
        : leiToCents(f.get("acquisitionLei")),
      description: String(f.get("description") ?? "").trim(),
      workDone: String(f.get("workDone") ?? "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      publish,
    };
    const res = await saveBikeSaleAction(input);
    setLoading(null);
    if (res.ok) router.refresh();
    else setError(res.error);
  }

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        submit(false);
      }}
      className="space-y-4 rounded-lg border border-border bg-card p-5"
    >
      {isDraft && bike.provisionalPriceCents != null ? (
        <p className="text-xs text-steel">Preț provizoriu la intake: {formatLei(bike.provisionalPriceCents)}</p>
      ) : null}

      {locked ? (
        <p className="rounded-md bg-manila/40 px-3 py-2 text-xs text-foreground/80">
          Bicicleta e {bike.status === "sold" ? "vândută" : "rezervată"}: prețul (
          <strong>{formatLei(bike.priceCents)}</strong>) e blocat. Poți încă modifica descrierea și
          lista de intervenții.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Preț de vânzare (lei)</label>
          <input
            name="priceLei"
            type="number"
            step="0.01"
            min="0"
            required
            disabled={locked}
            defaultValue={centsToLei(bike.priceCents)}
            className={`${fieldClass} disabled:cursor-not-allowed disabled:opacity-60`}
          />
        </div>
        <div>
          <label className={labelClass}>Cost de achiziție (lei)</label>
          <input
            name="acquisitionLei"
            type="number"
            step="0.01"
            min="0"
            disabled={locked}
            defaultValue={centsToLei(bike.acquisitionCostCents)}
            className={`${fieldClass} disabled:cursor-not-allowed disabled:opacity-60`}
          />
          <p className="mt-1 text-xs text-steel">Cât plătim proprietarului (pentru TVA la marjă).</p>
        </div>
      </div>

      <div>
        <label className={labelClass}>Descriere (pe baza constatării)</label>
        <textarea name="description" rows={3} defaultValue={bike.description} className={fieldClass} />
      </div>
      <div>
        <label className={labelClass}>Ce am făcut în atelier (câte o linie)</label>
        <textarea name="workDone" rows={3} defaultValue={bike.workDone.join("\n")} className={fieldClass} />
        <p className="mt-1 text-xs text-steel">Se completează pe baza fișei finale, după reparație.</p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={loading !== null}
          className="inline-flex h-11 cursor-pointer items-center rounded-full border border-asphalt/25 px-6 text-sm font-semibold text-foreground transition-colors hover:border-asphalt/50 disabled:opacity-60"
        >
          {loading === "save" ? "Se salvează…" : "Salvează"}
        </button>

        {isDraft ? (
          <button
            type="button"
            onClick={() => submit(true)}
            disabled={loading !== null || !hasIntake}
            title={hasIntake ? undefined : "Necesită fișa de constatare a atelierului"}
            className="inline-flex h-11 cursor-pointer items-center rounded-full bg-blue px-6 text-sm font-semibold text-white transition-colors hover:bg-blue/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading === "publish" ? "Se publică…" : "Publică bicicleta"}
          </button>
        ) : null}

        {isDraft && !hasIntake ? (
          <span className="text-xs text-amber-600 dark:text-amber-400">
            Publicarea e blocată până când atelierul depune fișa de constatare.
          </span>
        ) : null}
      </div>
    </form>
  );
}
