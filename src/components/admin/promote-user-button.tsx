"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { promoteUserToWorkshopAction } from "@/server/actions/admin/workshops";
import { fieldClass, labelClass, primaryBtn } from "@/components/auth/auth-shell";

/**
 * Per-user action (customers only): opens a popup to fill in the workshop-only
 * fields and turn the account into an atelier. The account email is fixed, so it
 * is shown, not editable.
 */
export function PromoteUserButton({ email }: { email: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    const res = await promoteUserToWorkshopAction({
      userEmail: email,
      name: String(f.get("name") ?? "").trim(),
      location: opt("location"),
      workHours: opt("workHours"),
      contactName: opt("contactName"),
      phone: opt("phone"),
    });
    setLoading(false);
    if (res.ok) {
      setOpen(false);
      router.refresh();
    } else {
      setError(res.error);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="inline-flex h-7 cursor-pointer items-center rounded-full border border-border px-2.5 text-xs font-medium text-foreground/80 transition-colors hover:border-asphalt/50"
      >
        Fă atelier
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transformă în atelier</DialogTitle>
            <DialogDescription>
              Contul <span className="font-mono text-foreground/80">{email}</span> devine cont de
              atelier (rol atelier).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="grid gap-3">
            <div>
              <label className={labelClass}>Nume atelier</label>
              <input name="name" required className={fieldClass} placeholder="ex. Atelier Bike Timișoara" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Locație</label>
                <input name="location" className={fieldClass} placeholder="opțional" />
              </div>
              <div>
                <label className={labelClass}>Program</label>
                <input name="workHours" className={fieldClass} placeholder="opțional" />
              </div>
              <div>
                <label className={labelClass}>Persoană de contact</label>
                <input name="contactName" className={fieldClass} placeholder="opțional" />
              </div>
              <div>
                <label className={labelClass}>Telefon</label>
                <input name="phone" className={fieldClass} placeholder="opțional" />
              </div>
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <button type="submit" className={primaryBtn} disabled={loading}>
              {loading ? "Se transformă…" : "Transformă în atelier"}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
