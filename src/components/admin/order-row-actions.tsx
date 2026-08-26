"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { transitionOrderStatusAction } from "@/server/actions/admin/orders";
import type { OrderStatus } from "@/server/constants/statuses";

const btn =
  "cursor-pointer rounded border border-border px-2.5 py-1 text-xs font-medium transition-colors hover:border-asphalt/50 disabled:opacity-50";

export function OrderRowActions({ id, status }: { id: string; status: OrderStatus }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function go(to: OrderStatus) {
    setError(null);
    start(async () => {
      const res = await transitionOrderStatusAction(id, to);
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {status === "pending" && (
        <>
          <button className={btn} disabled={pending} onClick={() => go("confirmed")}>
            Confirmă
          </button>
          <button className={`${btn} text-destructive`} disabled={pending} onClick={() => go("cancelled")}>
            Anulează
          </button>
        </>
      )}
      {status === "confirmed" && (
        <>
          <button className={btn} disabled={pending} onClick={() => go("completed")}>
            Finalizează
          </button>
          <button className={`${btn} text-destructive`} disabled={pending} onClick={() => go("cancelled")}>
            Anulează
          </button>
        </>
      )}
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  );
}
