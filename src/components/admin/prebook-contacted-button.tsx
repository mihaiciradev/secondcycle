"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markPrebookingContactedAction } from "@/server/actions/admin/prebookings";

export function PrebookContactedButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function mark() {
    setLoading(true);
    setError(null);
    const res = await markPrebookingContactedAction(id);
    setLoading(false);
    if (res.ok) router.refresh();
    else setError(res.error);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={mark}
        disabled={loading}
        className="inline-flex h-8 cursor-pointer items-center rounded-full bg-asphalt px-3.5 text-xs font-semibold text-paper transition-colors hover:bg-asphalt/90 disabled:opacity-60"
      >
        {loading ? "…" : "Marchează contactat"}
      </button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  );
}
