"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createWorkshopAccountAction } from "@/server/actions/admin/workshops";
import { fieldClass, primaryBtn } from "@/components/auth/auth-shell";

export function WorkshopCreateForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setError(null);
    const f = new FormData(form);
    const s = (k: string) => {
      const v = f.get(k);
      return v ? String(v).trim() : undefined;
    };
    const res = await createWorkshopAccountAction({
      name: s("name") ?? "",
      location: s("location"),
      workHours: s("workHours"),
      contactName: s("contactName"),
      phone: s("phone"),
      email: s("email") ?? "",
      password: s("password") ?? "",
    });
    setLoading(false);
    if (res.ok) {
      form.reset();
      router.refresh();
    } else {
      setError(res.error);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
      <input name="name" placeholder="Nume atelier" required className={fieldClass} />
      <input name="location" placeholder="Locație / adresă" className={fieldClass} />
      <input name="workHours" placeholder="Program (ex. L-V 9-18)" className={fieldClass} />
      <input name="contactName" placeholder="Persoană de contact" className={fieldClass} />
      <input name="phone" placeholder="Telefon" className={fieldClass} />
      <div className="sm:col-span-2 mt-2 border-t border-border pt-3">
        <p className="mb-2 font-mono text-xs uppercase tracking-wider text-steel">Cont de acces</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="email" type="email" placeholder="E-mail cont" required className={fieldClass} />
          <input
            name="password"
            type="text"
            placeholder="Parolă inițială (min. 10)"
            required
            minLength={10}
            className={fieldClass}
          />
        </div>
        <p className="mt-2 text-xs text-steel">
          Atelierul își poate schimba parola din contul lui după prima autentificare.
        </p>
      </div>
      {error ? <p className="text-sm text-destructive sm:col-span-2">{error}</p> : null}
      <div className="sm:col-span-2">
        <button type="submit" className={primaryBtn} disabled={loading}>
          {loading ? "Se creează…" : "Creează atelier"}
        </button>
      </div>
    </form>
  );
}
