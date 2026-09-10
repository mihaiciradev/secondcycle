"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CopyIcon, CheckIcon, Trash2Icon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteValuationAction } from "@/server/actions/admin/valuations";

/** Per-row actions for a valuation: copy the shareable link again, or delete
 *  the opinion (with a confirm). */
export function ValuationActions({
  id,
  url,
  who,
}: {
  id: string;
  url: string;
  who: string | null;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  }

  async function confirmDelete() {
    setLoading(true);
    setError(null);
    const res = await deleteValuationAction(id);
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
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={copy}
          title="Copiază linkul"
          className={`inline-flex h-7 items-center gap-1 rounded-full border px-2.5 text-xs font-medium transition-colors ${
            copied
              ? "border-emerald-500/50 text-emerald-600 dark:text-emerald-400"
              : "border-border text-foreground/70 hover:border-asphalt/50"
          }`}
        >
          {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
          {copied ? "Copiat" : "Link"}
        </button>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setOpen(true);
          }}
          title="Șterge părerea"
          aria-label="Șterge părerea"
          className="inline-flex size-7 items-center justify-center rounded-full border border-border text-foreground/60 transition-colors hover:border-destructive/50 hover:text-destructive"
        >
          <Trash2Icon className="size-3.5" />
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ștergi părerea?</DialogTitle>
            <DialogDescription>
              {who ? (
                <>
                  O să ștergi părerea lui{" "}
                  <span className="font-medium text-foreground">{who}</span>. Continui?
                </>
              ) : (
                <>O să ștergi această părere. Continui?</>
              )}
            </DialogDescription>
          </DialogHeader>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-9 cursor-pointer items-center rounded-full border border-border px-4 text-sm font-medium text-foreground/80 transition-colors hover:border-asphalt/50"
            >
              Renunță
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={loading}
              className="inline-flex h-9 cursor-pointer items-center rounded-full bg-destructive px-4 text-sm font-semibold text-white transition-colors hover:bg-destructive/90 disabled:opacity-60"
            >
              {loading ? "Se șterge…" : "Șterge"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
