"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createVoucherAction } from "@/server/actions/admin/vouchers";
import { fieldClass, labelClass, primaryBtn } from "@/components/auth/auth-shell";

type Partner = { id: string; name: string };

export function VoucherCreateDialog({ partners }: { partners: Partner[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [valueType, setValueType] = useState<"percent" | "amount">("percent");
  const [explanations, setExplanations] = useState<string[]>([""]);

  function reset() {
    setError(null);
    setValueType("percent");
    setExplanations([""]);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setError(null);
    const f = new FormData(form);
    const s = (k: string) => String(f.get(k) ?? "").trim();

    const rawValue = Number(s("valueAmount").replace(",", "."));
    if (!Number.isFinite(rawValue) || rawValue <= 0) {
      setLoading(false);
      setError("Valoarea reducerii trebuie să fie un număr pozitiv.");
      return;
    }
    // percent stays as-is; amount is entered in lei, stored in bani.
    const valueAmount = valueType === "percent" ? Math.round(rawValue) : Math.round(rawValue * 100);

    const res = await createVoucherAction({
      title: s("title"),
      subtitle: s("subtitle") || null,
      explanations: explanations.map((x) => x.trim()).filter(Boolean),
      valueType,
      valueAmount,
      validFrom: s("validFrom") || null,
      validUntil: s("validUntil"),
      partnerId: s("partnerId") || null,
    });
    setLoading(false);
    if (res.ok) {
      form.reset();
      reset();
      setOpen(false);
      router.refresh();
    } else {
      setError(res.error);
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
          <Button variant="default" size="lg">
            <PlusIcon />
            Creează voucher
          </Button>
        }
      />
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Creează un voucher</DialogTitle>
          <DialogDescription>
            Datele se fixează acum. Îl aloci apoi unui cont și trimiți e-mailul din listă.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Titlu</label>
            <input name="title" required placeholder="ex. 20% la accesorii" className={`${fieldClass} w-full`} />
          </div>
          <div>
            <label className={labelClass}>Subtitlu (opțional)</label>
            <input name="subtitle" placeholder="ex. valabil o singură dată" className={`${fieldClass} w-full`} />
          </div>

          <div>
            <label className={labelClass}>Explicații</label>
            <div className="space-y-2">
              {explanations.map((val, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={val}
                    onChange={(e) =>
                      setExplanations((list) => list.map((x, j) => (j === i ? e.target.value : x)))
                    }
                    placeholder={`Explicație ${i + 1}`}
                    className={`${fieldClass} flex-1`}
                  />
                  {explanations.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => setExplanations((list) => list.filter((_, j) => j !== i))}
                      className="inline-flex size-9 items-center justify-center rounded-full border border-border text-steel hover:border-destructive/50 hover:text-destructive"
                      aria-label="Șterge explicația"
                    >
                      <XIcon className="size-4" />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setExplanations((list) => [...list, ""])}
              className="mt-2 text-xs font-medium text-blue underline-offset-2 hover:underline"
            >
              + Adaugă o explicație
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Tip reducere</label>
              <select
                value={valueType}
                onChange={(e) => setValueType(e.target.value as "percent" | "amount")}
                className={`${fieldClass} w-full`}
              >
                <option value="percent">Procent (%)</option>
                <option value="amount">Sumă fixă (lei)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{valueType === "percent" ? "Procent" : "Sumă (lei)"}</label>
              <input
                name="valueAmount"
                type="number"
                min="0"
                step={valueType === "percent" ? "1" : "0.01"}
                required
                placeholder={valueType === "percent" ? "ex. 20" : "ex. 150"}
                className={`${fieldClass} w-full`}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Valabil de la (opțional)</label>
              <input name="validFrom" type="date" className={`${fieldClass} w-full`} />
            </div>
            <div>
              <label className={labelClass}>Valabil până la</label>
              <input name="validUntil" type="date" required className={`${fieldClass} w-full`} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Partener (cine îl scanează)</label>
            <select name="partnerId" defaultValue="" className={`${fieldClass} w-full`}>
              <option value="">Fără partener</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <button type="submit" className={primaryBtn} disabled={loading}>
            {loading ? "Se creează…" : "Creează voucher"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
