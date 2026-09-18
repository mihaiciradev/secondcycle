"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";
import { deleteVoucherAction } from "@/server/actions/admin/vouchers";

/** Admin-only: delete a voucher, with an inline confirm. */
export function VoucherDelete({ voucherId, title }: { voucherId: string; title: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setLoading(true);
    setError(null);
    const res = await deleteVoucherAction(voucherId);
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      setError(res.error);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <button
          type="button"
          onClick={remove}
          disabled={loading}
          className="inline-flex h-7 cursor-pointer items-center rounded-full bg-destructive px-2.5 text-xs font-semibold text-white transition-colors hover:bg-destructive/90 disabled:opacity-60"
        >
          {loading ? "…" : "Șterge"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="cursor-pointer text-[0.65rem] text-steel hover:text-foreground"
        >
          renunță
        </button>
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col items-start gap-0.5">
      <button
        type="button"
        onClick={() => setConfirming(true)}
        title={`Șterge „${title}”`}
        aria-label={`Șterge voucherul ${title}`}
        className="inline-flex size-7 items-center justify-center rounded-full border border-border text-foreground/60 transition-colors hover:border-destructive/50 hover:text-destructive"
      >
        <Trash2Icon className="size-3.5" />
      </button>
      {error ? <span className="text-[0.6rem] text-destructive">{error}</span> : null}
    </span>
  );
}
