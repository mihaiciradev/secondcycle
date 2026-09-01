"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createServiceRecordAction,
  updateServiceRecordAction,
} from "@/server/actions/workshop/service-records";
import {
  SERVICE_CHECK_ITEMS,
  SERVICE_CHECK_STATUS_LABEL,
  serviceCheckStatuses,
} from "@/server/constants/app";
import { fieldClass, labelClass, primaryBtn } from "@/components/auth/auth-shell";

type ChecklistEntry = { item: string; status: string; note?: string };
type Initial = {
  performedBy: string;
  performedAt: string | Date;
  summary: string | null;
  checklist: ChecklistEntry[];
  marketValueCents?: number | null;
  suggestedPurchaseCents?: number | null;
  estimatedRepairCents?: number | null;
  actualRepairCents?: number | null;
};

const centsToLei = (c?: number | null) => (c != null ? String(c / 100) : "");
function leiToCents(v: FormDataEntryValue | null): number | undefined {
  if (!v) return undefined;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : undefined;
}

function MoneyField({ name, label, hint, defaultValue }: { name: string; label: string; hint?: string; defaultValue?: string }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input name={name} type="number" min="0" step="1" inputMode="numeric" placeholder="lei" defaultValue={defaultValue} className={fieldClass} />
      {hint ? <p className="mt-1 text-xs text-steel">{hint}</p> : null}
    </div>
  );
}

export function ServiceRecordForm({
  bikeId,
  kind,
  recordId,
  initial,
  onDone,
}: {
  bikeId: string;
  kind: "intake" | "final";
  recordId?: string;
  initial?: Initial;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const statuses = serviceCheckStatuses(kind);
  const defaultStatus = kind === "intake" ? "to_check" : "ok";

  const today = new Date().toISOString().slice(0, 10);
  const initialDate = initial
    ? (typeof initial.performedAt === "string"
        ? initial.performedAt
        : new Date(initial.performedAt).toISOString()
      ).slice(0, 10)
    : today;
  const initMap = new Map((initial?.checklist ?? []).map((c) => [c.item, c]));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setError(null);
    const f = new FormData(form);
    const checklist = SERVICE_CHECK_ITEMS.map((item) => {
      const note = f.get(`note:${item}`);
      return {
        item,
        status: String(f.get(`status:${item}`) ?? defaultStatus),
        note: note ? String(note).trim() || undefined : undefined,
      };
    });
    const fields = {
      bikeId,
      kind,
      performedBy: String(f.get("performedBy") ?? "").trim(),
      performedAt: String(f.get("performedAt") ?? today),
      summary: f.get("summary") ? String(f.get("summary")).trim() : undefined,
      checklist,
      marketValueCents: kind === "intake" ? leiToCents(f.get("marketValueCents")) : undefined,
      suggestedPurchaseCents: kind === "intake" ? leiToCents(f.get("suggestedPurchaseCents")) : undefined,
      estimatedRepairCents: kind === "intake" ? leiToCents(f.get("estimatedRepairCents")) : undefined,
      actualRepairCents: kind === "final" ? leiToCents(f.get("actualRepairCents")) : undefined,
    };
    const res = recordId
      ? await updateServiceRecordAction({ recordId, ...fields })
      : await createServiceRecordAction(fields);
    setLoading(false);
    if (res.ok) {
      onDone?.();
      router.refresh();
    } else {
      setError(res.error);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Mecanic</label>
          <input name="performedBy" required defaultValue={initial?.performedBy ?? ""} className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>Data</label>
          <input name="performedAt" type="date" defaultValue={initialDate} required className={fieldClass} />
        </div>
      </div>

      <div className="space-y-2">
        {SERVICE_CHECK_ITEMS.map((item) => (
          <div key={item} className="grid items-center gap-2 sm:grid-cols-[1fr_150px_1.4fr]">
            <span className="text-sm font-medium">{item}</span>
            <select name={`status:${item}`} defaultValue={initMap.get(item)?.status ?? defaultStatus} className={fieldClass}>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {SERVICE_CHECK_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
            <input
              name={`note:${item}`}
              placeholder="Notă (opțional)"
              defaultValue={initMap.get(item)?.note ?? ""}
              className={fieldClass}
            />
          </div>
        ))}
      </div>

      {/* Valuation: internal, admin-only (never shown to buyers). */}
      <div className="rounded-lg border border-dashed border-border p-4">
        <p className="mb-3 font-mono text-xs uppercase tracking-wider text-steel">Evaluare (intern)</p>
        {kind === "intake" ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <MoneyField name="marketValueCents" label="Preț de piață (înainte)" hint="Cât valorează acum, nereparată" defaultValue={centsToLei(initial?.marketValueCents)} />
            <MoneyField name="suggestedPurchaseCents" label="Cât ați da pe ea" hint="Preț de achiziție sugerat" defaultValue={centsToLei(initial?.suggestedPurchaseCents)} />
            <MoneyField name="estimatedRepairCents" label="Cost reparații estimat" defaultValue={centsToLei(initial?.estimatedRepairCents)} />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            <MoneyField name="actualRepairCents" label="Cost reparații real" defaultValue={centsToLei(initial?.actualRepairCents)} />
          </div>
        )}
      </div>

      <div>
        <label className={labelClass}>{kind === "intake" ? "Cum arată bicicleta" : "Ce s-a făcut"}</label>
        <textarea name="summary" rows={3} defaultValue={initial?.summary ?? ""} className={fieldClass} />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <button type="submit" className={primaryBtn} disabled={loading}>
        {loading ? "Se salvează…" : "Salvează fișa"}
      </button>
    </form>
  );
}
