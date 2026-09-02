"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { promoteUserToWorkshopAction } from "@/server/actions/admin/workshops";
import { fieldClass, primaryBtn } from "@/components/auth/auth-shell";

export function PromoteWorkshopForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setError(null);
    const f = new FormData(form);
    const opt = (k: string) => {
      const v = f.get(k);
      return v && String(v).trim() ? String(v).trim() : undefined;
    };
    const input = {
      userEmail: String(f.get("userEmail") ?? "").trim(),
      name: String(f.get("name") ?? "").trim(),
      location: opt("location"),
      workHours: opt("workHours"),
      contactName: opt("contactName"),
      phone: opt("phone"),
    };
    const res = await promoteUserToWorkshopAction(input);
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
      <input name="userEmail" type="email" placeholder="E-mail cont existent" required className={fieldClass} />
      <input name="name" placeholder="Nume atelier" required className={fieldClass} />
      <input name="location" placeholder="Locație (opțional)" className={fieldClass} />
      <input name="workHours" placeholder="Program (opțional)" className={fieldClass} />
      <input name="contactName" placeholder="Persoană de contact (opțional)" className={fieldClass} />
      <input name="phone" placeholder="Telefon (opțional)" className={fieldClass} />
      {error ? <p className="text-sm text-destructive sm:col-span-2">{error}</p> : null}
      <div className="sm:col-span-2">
        <button type="submit" className={primaryBtn} disabled={loading}>
          {loading ? "Se transformă…" : "Transformă în atelier"}
        </button>
      </div>
    </form>
  );
}
