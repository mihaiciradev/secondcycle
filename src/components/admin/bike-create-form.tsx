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
  // Some old bikes have unknown make/model; then we use a free "name" instead.
  const [unknownMake, setUnknownMake] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const f = new FormData(e.currentTarget);
    const provLei = Number(f.get("provisionalLei") ?? 0);
    const provCents = Math.round(provLei * 100);

    // Intake only: the provisional price becomes the current price; the final
    // selling price, description and "what we did" are set later, at publish.
    const orNull = (k: string) => (String(f.get(k) ?? "").trim() || null) as string | null;
    const input = {
      sku: String(f.get("sku") ?? "").trim(),
      frameNumber: orNull("frameNumber"),
      brand: unknownMake ? null : orNull("brand"),
      model: unknownMake ? null : orNull("model"),
      name: unknownMake ? orNull("name") : null,
      modelYear: orNull("modelYear"),
      category: String(f.get("category") ?? "city"),
      frameSize: orNull("frameSize"),
      wheelSize: orNull("wheelSize"),
      conditionGrade: "A",
      priceCents: provCents,
      provisionalPriceCents: provCents,
      adminNotes: orNull("adminNotes"),
      status: "draft",
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
      <input name="frameNumber" placeholder="Serie cadru (opțional)" className={fieldClass} />

      <div className="sm:col-span-2 flex items-center justify-between gap-3">
        <span className="font-mono text-xs uppercase tracking-wider text-steel">
          {unknownMake ? "Nume bicicletă" : "Marcă și model"}
        </span>
        <button
          type="button"
          onClick={() => setUnknownMake((v) => !v)}
          className="cursor-pointer text-xs font-medium text-blue underline-offset-2 hover:underline"
        >
          {unknownMake ? "Știu marca și modelul" : "Nu știu marca/modelul"}
        </button>
      </div>

      {unknownMake ? (
        <input
          name="name"
          placeholder="Nume bicicletă (ex. Cursieră vintage albastră)"
          className={`${fieldClass} sm:col-span-2`}
        />
      ) : (
        <>
          <input name="brand" placeholder="Marcă (opțional)" className={fieldClass} />
          <input name="model" placeholder="Model (opțional)" className={fieldClass} />
        </>
      )}

      <input name="modelYear" placeholder="An (ex. 2019 sau 2018-2020)" className={fieldClass} />
      <select name="category" className={fieldClass} defaultValue="city">
        {categories.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      <input name="frameSize" placeholder="Mărime cadru (M / 54, opțional)" className={fieldClass} />
      <input name="wheelSize" placeholder="Roți (28, opțional)" className={fieldClass} />
      <input
        name="provisionalLei"
        type="number"
        step="0.01"
        placeholder="Preț provizoriu (aprox., lei)"
        required
        className={fieldClass}
      />
      <select name="workshopId" className={fieldClass} defaultValue="">
        <option value="">Fără atelier alocat</option>
        {workshops.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </select>
      <textarea
        name="adminNotes"
        rows={2}
        placeholder="Notițe interne: de unde e, unde e depozitată, cât ar trebui să coste... (opțional, doar pentru voi)"
        className={`${fieldClass} resize-y sm:col-span-2`}
      />
      <p className="text-xs text-steel sm:col-span-2">
        Bicicleta se creează ca ciornă. Prețul final, descrierea și „ce am făcut" se completează
        după fișa de constatare a atelierului, la publicare.
      </p>
      {error ? <p className="text-sm text-destructive sm:col-span-2">{error}</p> : null}
      <div className="sm:col-span-2">
        <button type="submit" className={primaryBtn} disabled={loading}>
          {loading ? "Se salvează…" : "Adaugă bicicleta (ciornă)"}
        </button>
      </div>
    </form>
  );
}
