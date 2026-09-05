"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateBikeDetailsAction } from "@/server/actions/admin/bikes";
import { fieldClass, labelClass } from "@/components/auth/auth-shell";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "city", label: "Oraș" },
  { value: "trekking", label: "Trekking" },
  { value: "mtb", label: "MTB" },
  { value: "road", label: "Cursieră" },
  { value: "kids", label: "Copii" },
  { value: "ebike", label: "Electrică" },
];
const GRADES = ["A", "B", "C"];

const centsToLei = (c?: number | null) => (c != null ? String(c / 100) : "");
const leiToCents = (v: FormDataEntryValue | null): number | null => {
  if (!v || !String(v).trim()) return null;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
};

export function BikeDetailsForm({
  bike,
}: {
  bike: {
    id: string;
    sku: string;
    frameNumber: string | null;
    brand: string | null;
    model: string | null;
    name: string | null;
    modelYear: string | null;
    category: string;
    frameSize: string | null;
    wheelSize: string | null;
    conditionGrade: string;
    oldPriceCents: number | null;
    adminNotes: string | null;
  };
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;
    setLoading(true);
    setError(null);
    setSaved(false);
    const f = new FormData(form);
    const res = await updateBikeDetailsAction({
      bikeId: bike.id,
      sku: String(f.get("sku") ?? "").trim(),
      frameNumber: String(f.get("frameNumber") ?? "").trim() || null,
      brand: String(f.get("brand") ?? "").trim() || null,
      model: String(f.get("model") ?? "").trim() || null,
      name: String(f.get("name") ?? "").trim() || null,
      modelYear: String(f.get("modelYear") ?? "").trim() || null,
      category: String(f.get("category") ?? ""),
      frameSize: String(f.get("frameSize") ?? "").trim() || null,
      wheelSize: String(f.get("wheelSize") ?? "").trim() || null,
      conditionGrade: String(f.get("conditionGrade") ?? ""),
      oldPriceCents: leiToCents(f.get("oldPriceLei")),
      adminNotes: String(f.get("adminNotes") ?? "").trim() || null,
    });
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
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Marcă</label>
          <input
            name="brand"
            defaultValue={bike.brand ?? ""}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Model</label>
          <input
            name="model"
            defaultValue={bike.model ?? ""}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Nume afișat (dacă nu știm marca/modelul)
        </label>
        <input
          name="name"
          placeholder="ex. Bicicletă de oraș vintage"
          defaultValue={bike.name ?? ""}
          className={fieldClass}
        />
        <p className="mt-1 text-xs text-steel">
          Folosit ca titlu doar dacă marca și modelul sunt goale.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className={labelClass}>An</label>
          <input
            name="modelYear"
            placeholder="ex. 2019 sau 2018-2020"
            defaultValue={bike.modelYear ?? ""}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Categorie</label>
          <select
            name="category"
            defaultValue={bike.category}
            className={fieldClass}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Stare (grad)</label>
          <select
            name="conditionGrade"
            defaultValue={bike.conditionGrade}
            className={fieldClass}
          >
            {GRADES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Mărime cadru</label>
          <input
            name="frameSize"
            defaultValue={bike.frameSize ?? ""}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Mărime roți</label>
          <input
            name="wheelSize"
            defaultValue={bike.wheelSize ?? ""}
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className={labelClass}>SKU</label>
          <input
            name="sku"
            required
            defaultValue={bike.sku}
            className={fieldClass}
          />
          <p className="mt-1 text-xs text-steel">
            Schimbarea SKU schimbă și linkul public.
          </p>
        </div>
        <div>
          <label className={labelClass}>Serie cadru</label>
          <input
            name="frameNumber"
            defaultValue={bike.frameNumber ?? ""}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Preț vechi (lei)</label>
          <input
            name="oldPriceLei"
            type="number"
            step="0.01"
            min="0"
            defaultValue={centsToLei(bike.oldPriceCents)}
            className={fieldClass}
          />
          <p className="mt-1 text-xs text-steel">
            Pentru afișarea reducerii (opțional).
          </p>
        </div>
      </div>

      <div>
        <label className={labelClass}>Notițe interne</label>
        <textarea
          name="adminNotes"
          rows={3}
          placeholder="De unde e, unde e depozitată, cât ar trebui să coste, orice altceva..."
          defaultValue={bike.adminNotes ?? ""}
          className={`${fieldClass} resize-y`}
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 cursor-pointer items-center rounded-full border border-asphalt/25 px-6 text-sm font-semibold text-foreground transition-colors hover:border-asphalt/50 disabled:opacity-60"
        >
          {loading ? "Se salvează…" : "Salvează detaliile"}
        </button>
        {saved ? (
          <span className="text-sm text-emerald-600 dark:text-emerald-400">
            Salvat ✓
          </span>
        ) : null}
      </div>
    </form>
  );
}
