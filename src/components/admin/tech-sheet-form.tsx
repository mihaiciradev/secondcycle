"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateBikeTechSheetAction } from "@/server/actions/admin/bikes";
import { fieldClass, labelClass } from "@/components/auth/auth-shell";
import { TECH_SHEET_FIELDS, type TechSheet } from "@/lib/tech-sheet";

export function TechSheetForm({ bikeId, techSheet }: { bikeId: string; techSheet: TechSheet }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  /** Concatenate all filled fields (Label: value) and copy to clipboard. */
  async function copyAll() {
    const form = formRef.current;
    if (!form) return;
    const f = new FormData(form);
    const lines: string[] = [];
    for (const field of TECH_SHEET_FIELDS) {
      const v = String(f.get(field.key) ?? "").trim();
      if (v) lines.push(`${field.label}: ${v}`);
    }
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;
    setLoading(true);
    setError(null);
    setSaved(false);
    const f = new FormData(form);
    const sheet: Record<string, string> = {};
    for (const field of TECH_SHEET_FIELDS) {
      sheet[field.key] = String(f.get(field.key) ?? "").trim();
    }
    const res = await updateBikeTechSheetAction({ bikeId, techSheet: sheet });
    setLoading(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    } else {
      setError(res.error);
    }
  }

  return (
    <form ref={formRef} onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {TECH_SHEET_FIELDS.map((field) => (
          <div key={field.key}>
            <label className={labelClass}>{field.label}</label>
            <textarea
              name={field.key}
              rows={2}
              defaultValue={techSheet[field.key] ?? ""}
              className={`${fieldClass} resize-y`}
            />
          </div>
        ))}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 cursor-pointer items-center rounded-full border border-asphalt/25 px-6 text-sm font-semibold text-foreground transition-colors hover:border-asphalt/50 disabled:opacity-60"
        >
          {loading ? "Se salvează…" : "Salvează fișa tehnică"}
        </button>
        <button
          type="button"
          onClick={copyAll}
          className="inline-flex h-11 cursor-pointer items-center rounded-full border border-border px-5 text-sm font-medium text-foreground/80 transition-colors hover:border-asphalt/50"
        >
          {copied ? "Copiat ✓" : "Copiază fișa"}
        </button>
        {saved ? <span className="text-sm text-emerald-600 dark:text-emerald-400">Salvat ✓</span> : null}
      </div>
    </form>
  );
}
