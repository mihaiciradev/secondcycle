"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createServiceRecordAction } from "@/server/actions/workshop/service-records";
import {
  SERVICE_CHECK_ITEMS,
  SERVICE_CHECK_STATUSES,
  SERVICE_CHECK_STATUS_LABEL,
} from "@/server/constants/app";
import { fieldClass, labelClass, primaryBtn } from "@/components/auth/auth-shell";

export function ServiceRecordForm({ bikeId, kind }: { bikeId: string; kind: "intake" | "final" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

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
        status: String(f.get(`status:${item}`) ?? "ok"),
        note: note ? String(note).trim() || undefined : undefined,
      };
    });
    const res = await createServiceRecordAction({
      bikeId,
      kind,
      performedBy: String(f.get("performedBy") ?? "").trim(),
      performedAt: String(f.get("performedAt") ?? today),
      summary: f.get("summary") ? String(f.get("summary")).trim() : undefined,
      checklist,
    });
    setLoading(false);
    if (res.ok) router.refresh();
    else setError(res.error);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Mecanic</label>
          <input name="performedBy" required className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>Data</label>
          <input name="performedAt" type="date" defaultValue={today} required className={fieldClass} />
        </div>
      </div>

      <div className="space-y-2">
        {SERVICE_CHECK_ITEMS.map((item) => (
          <div key={item} className="grid items-center gap-2 sm:grid-cols-[1fr_150px_1.4fr]">
            <span className="text-sm font-medium">{item}</span>
            <select name={`status:${item}`} defaultValue="ok" className={fieldClass}>
              {SERVICE_CHECK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {SERVICE_CHECK_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
            <input name={`note:${item}`} placeholder="Notă (opțional)" className={fieldClass} />
          </div>
        ))}
      </div>

      <div>
        <label className={labelClass}>
          {kind === "intake" ? "Cum arată bicicleta" : "Ce s-a făcut"}
        </label>
        <textarea name="summary" rows={3} className={fieldClass} />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <button type="submit" className={primaryBtn} disabled={loading}>
        {loading ? "Se salvează…" : "Salvează fișa"}
      </button>
    </form>
  );
}
