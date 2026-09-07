"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteBikeAction, transitionBikeStatusAction } from "@/server/actions/admin/bikes";
import type { BikeStatus } from "@/server/constants/statuses";

const btn =
  "cursor-pointer rounded border border-border px-2.5 py-1 text-xs font-medium transition-colors hover:border-asphalt/50 disabled:opacity-50";

export function BikeRowActions({ id, status }: { id: string; status: BikeStatus }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function transition(to: BikeStatus) {
    setError(null);
    start(async () => {
      const res = await transitionBikeStatusAction(id, to);
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  }
  function remove() {
    if (!confirm("Ștergi această ciornă?")) return;
    setError(null);
    start(async () => {
      const res = await deleteBikeAction(id);
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  }
  function markSold() {
    if (!confirm("Marchezi bicicleta ca vândută (offline)? Dispare din catalog, dar linkul rămâne activ."))
      return;
    transition("sold");
  }

  const canSellOffline = status === "draft" || status === "available" || status === "withdrawn";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {status === "draft" && (
        <>
          <button className={btn} disabled={pending} onClick={() => transition("available")}>
            Publică
          </button>
          <button className={`${btn} text-destructive`} disabled={pending} onClick={remove}>
            Șterge
          </button>
        </>
      )}
      {status === "available" && (
        <button className={btn} disabled={pending} onClick={() => transition("withdrawn")}>
          Retrage
        </button>
      )}
      {status === "withdrawn" && (
        <button className={btn} disabled={pending} onClick={() => transition("available")}>
          Republică
        </button>
      )}
      {status === "reserved" && (
        <button className={btn} disabled={pending} onClick={() => transition("available")}>
          Eliberează
        </button>
      )}
      {canSellOffline && (
        <button className={btn} disabled={pending} onClick={markSold} title="Vânzare offline (pe negru)">
          Marchează vândută
        </button>
      )}
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  );
}
