"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createPartnerAccountAction } from "@/server/actions/admin/partners";
import { fieldClass, primaryBtn } from "@/components/auth/auth-shell";

/** Admin creates a partner (collab) account, just like a workshop. */
export function PartnerCreateDialog() {
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
    const s = (k: string) => {
      const v = f.get(k);
      return v ? String(v).trim() : undefined;
    };
    const res = await createPartnerAccountAction({
      name: s("name") ?? "",
      contactName: s("contactName"),
      phone: s("phone"),
      email: s("email") ?? "",
      password: s("password") ?? "",
    });
    setLoading(false);
    if (res.ok) {
      form.reset();
      setOpen(false);
      router.refresh();
    } else {
      setError(res.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="default" size="lg">
            <PlusIcon />
            Adaugă partener
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adaugă un partener</DialogTitle>
          <DialogDescription>
            Creează un cont de partener (collab). Singura lui funcție e să scaneze vouchere.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
          <input name="name" placeholder="Nume partener" required className={fieldClass} />
          <input name="contactName" placeholder="Persoană de contact" className={fieldClass} />
          <input name="phone" placeholder="Telefon" className={`${fieldClass} sm:col-span-2`} />
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
          </div>
          {error ? <p className="text-sm text-destructive sm:col-span-2">{error}</p> : null}
          <div className="sm:col-span-2">
            <button type="submit" className={primaryBtn} disabled={loading}>
              {loading ? "Se creează…" : "Creează partener"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
