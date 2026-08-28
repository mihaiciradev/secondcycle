"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBikeAction } from "@/server/actions/admin/bikes";
import { fieldClass, primaryBtn } from "@/components/auth/auth-shell";

const categories = [
  ["city", "Oraș"],
  ["trekking", "Trekking"],
  ["mtb", "Munte"],
  ["road", "Cursieră"],
  ["kids", "Copii"],
  ["ebike", "E-bike"],
] as const;

export function BikeCreateForm({ workshops }: { workshops: { id: string; name: string }[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const f = new FormData(e.currentTarget);
    const num = (k: string) => {
      const v = f.get(k);
      return v ? Number(v) : undefined;
    };
    const priceLei = Number(f.get("priceLei") ?? 0);
    const oldPriceLei = f.get("oldPriceLei") ? Number(f.get("oldPriceLei")) : undefined;

    const input = {
      sku: String(f.get("sku") ?? "").trim(),
      frameNumber: String(f.get("frameNumber") ?? "").trim(),
      brand: String(f.get("brand") ?? "").trim(),
      model: String(f.get("model") ?? "").trim(),
      modelYear: num("modelYear") ?? null,
      category: String(f.get("category") ?? "city"),
      frameSize: String(f.get("frameSize") ?? "").trim(),
      wheelSize: String(f.get("wheelSize") ?? "").trim(),
      conditionGrade: "A",
      priceCents: Math.round(priceLei * 100),
      oldPriceCents: oldPriceLei != null ? Math.round(oldPriceLei * 100) : null,
      description: String(f.get("description") ?? ""),
      workDone: String(f.get("workDone") ?? "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      status: String(f.get("status") ?? "draft"),
      workshopId: f.get("workshopId") ? String(f.get("workshopId")) : null,
    };

    const res = await createBikeAction(input);
    setLoading(false);
    if (res.ok) {
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } else {
      setError(res.error);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
      <input name="sku" placeholder="SKU (RO-4471)" required className={fieldClass} />
      <input name="frameNumber" placeholder="Serie cadru" required className={fieldClass} />
      <input name="brand" placeholder="Marcă" required className={fieldClass} />
      <input name="model" placeholder="Model" required className={fieldClass} />
      <input name="modelYear" type="number" placeholder="An" className={fieldClass} />
      <select name="category" className={fieldClass} defaultValue="city">
        {categories.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      <input name="frameSize" placeholder="Mărime cadru (M / 54)" required className={fieldClass} />
      <input name="wheelSize" placeholder='Roți (28)' required className={fieldClass} />
      <select name="status" className={fieldClass} defaultValue="draft">
        <option value="draft">Ciornă</option>
        <option value="available">Disponibilă</option>
      </select>
      <select name="workshopId" className={`${fieldClass} sm:col-span-2`} defaultValue="">
        <option value="">Fără atelier alocat</option>
        {workshops.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </select>
      <input name="priceLei" type="number" step="0.01" placeholder="Preț (lei)" required className={fieldClass} />
      <input name="oldPriceLei" type="number" step="0.01" placeholder="Preț vechi (lei, opțional)" className={fieldClass} />
      <textarea name="description" placeholder="Descriere" rows={2} className={`${fieldClass} sm:col-span-2`} />
      <textarea
        name="workDone"
        placeholder="Ce am făcut (câte o linie)"
        rows={3}
        className={`${fieldClass} sm:col-span-2`}
      />
      {error ? <p className="text-sm text-destructive sm:col-span-2">{error}</p> : null}
      <div className="sm:col-span-2">
        <button type="submit" className={primaryBtn} disabled={loading}>
          {loading ? "Se salvează…" : "Adaugă bicicleta"}
        </button>
      </div>
    </form>
  );
}
