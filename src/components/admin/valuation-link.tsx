"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LinkIcon, CopyIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createValuationLinkAction } from "@/server/actions/admin/valuations";
import { fieldClass } from "@/components/auth/auth-shell";

/** Admin control: mint a private valuation link for this bike. Optionally
 *  pre-fills the mechanic's name into the link. */
export function ValuationLink({ bikeId }: { bikeId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function reset() {
    setName("");
    setError(null);
    setUrl(null);
    setCopied(false);
  }

  async function generate() {
    setLoading(true);
    setError(null);
    const res = await createValuationLinkAction({
      bikeId,
      suggestedName: name.trim() || null,
    });
    setLoading(false);
    if (res.ok) {
      setUrl(res.url);
      router.refresh(); // show the new pending slot in the list
    } else {
      setError(res.error);
    }
  }

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked; the field is selectable as a fallback */
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <LinkIcon />
            Cere o părere de preț
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link privat de evaluare</DialogTitle>
          <DialogDescription>
            Trimite-i unui mecanic un link privat ca să ne spună cât face bicicleta pe piață și cât ar
            da pe ea. Linkul nu e indexat de Google.
          </DialogDescription>
        </DialogHeader>

        {url ? (
          <div className="space-y-3">
            <label className="block font-mono text-xs uppercase tracking-wider text-steel">
              Link de trimis
            </label>
            <div className="flex gap-2">
              <input
                readOnly
                value={url}
                onFocus={(e) => e.currentTarget.select()}
                className={`${fieldClass} flex-1 font-mono text-xs`}
              />
              <Button type="button" variant="default" size="lg" onClick={copy}>
                {copied ? <CheckIcon /> : <CopyIcon />}
                {copied ? "Copiat" : "Copiază"}
              </Button>
            </div>
            <p className="text-xs text-steel">
              Poți genera câte linkuri vrei (câte un mecanic fiecare). Răspunsul apare mai jos, în
              pagina bicicletei, cu numele celui care l-a completat.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label htmlFor="mech-name" className="block font-mono text-xs uppercase tracking-wider text-steel">
                Numele mecanicului (opțional)
              </label>
              <input
                id="mech-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex. Atelier Doi Roți"
                className={`${fieldClass} mt-1.5 w-full`}
              />
              <p className="mt-1.5 text-xs text-steel">
                Dacă îl știi, îl trecem în link și apare deja completat. Dacă nu, îl completează cel
                care deschide linkul.
              </p>
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="button" variant="default" size="lg" onClick={generate} disabled={loading}>
              {loading ? "Se generează…" : "Generează link"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
