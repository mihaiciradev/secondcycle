"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CopyIcon, CheckIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { retryInvoiceAction } from "@/server/actions/admin/invoices";

export function InvoiceStatus({
  orderId,
  status,
  info,
}: {
  orderId: string;
  status: string | null;
  info: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [lastOk, setLastOk] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  async function retry() {
    setLoading(true);
    setMessage(null);
    const res = await retryInvoiceAction(orderId);
    setLoading(false);
    setMessage(res.info);
    setLastOk(res.ok);
    // Refresh the badge in a transition so the admin table doesn't blank out to
    // the page loading state; the row updates in place.
    startTransition(() => router.refresh());
  }

  async function copyDetail() {
    if (!detail) return;
    try {
      await navigator.clipboard.writeText(detail);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked; the dialog text is selectable as a fallback */
    }
  }

  const badge =
    status === "ok"
      ? "bg-lime text-asphalt"
      : status === "error"
        ? "bg-red-500/15 text-red-600 dark:text-red-400"
        : "bg-asphalt/10 text-steel";
  const label = status === "ok" ? "Emisă" : status === "error" ? "Eroare" : "Neemisă";

  // Show the reason inline: the just-returned retry message, or the stored info
  // on a failed invoice. So the admin sees WHY, not just "Eroare".
  const detail = message ?? (status === "error" ? info : null);
  // A retry that just succeeded reads as good news; a stored error stays red.
  const detailIsError = message ? lastOk === false : status === "error";
  // Long errors get a "Vezi tot" button + a copyable dialog so nothing is lost.
  const isLong = Boolean(detail && detail.length > 90);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 font-mono text-[0.65rem] ${badge}`}>{label}</span>
        {status !== "ok" ? (
          <button
            type="button"
            onClick={retry}
            disabled={loading || pending}
            className="cursor-pointer font-mono text-[0.65rem] text-blue underline-offset-2 hover:underline disabled:opacity-60"
          >
            {loading ? "se emite…" : "reemite"}
          </button>
        ) : null}
      </div>

      {detail ? (
        <div className="max-w-[260px]">
          <p
            title={detail}
            className={`line-clamp-2 break-words text-[0.65rem] leading-snug ${
              detailIsError ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {detail}
          </p>
          {isLong ? (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-0.5 cursor-pointer font-mono text-[0.65rem] text-blue underline-offset-2 hover:underline"
            >
              Vezi tot
            </button>
          ) : null}
        </div>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{detailIsError ? "Eroare la factură" : "Detalii factură"}</DialogTitle>
            <DialogDescription>
              Mesajul complet de la SoftPro. Copiază-l dacă vrei să-l trimiți mai departe.
            </DialogDescription>
          </DialogHeader>

          <pre className="max-h-[50vh] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs leading-relaxed text-foreground/90">
            {detail}
          </pre>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={copyDetail}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-border px-4 text-sm font-medium text-foreground/80 transition-colors hover:border-asphalt/50"
            >
              {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
              {copied ? "Copiat" : "Copiază"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
