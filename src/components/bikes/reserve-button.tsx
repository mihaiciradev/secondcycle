"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reserveBikeAction } from "@/server/actions/reservations";

export function ReserveButton({ bikeId }: { bikeId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reserve() {
    setLoading(true);
    setError(null);
    const res = await reserveBikeAction(bikeId);
    if (res.ok) {
      router.push("/checkout");
    } else {
      setLoading(false);
      setError(res.error);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={reserve}
        disabled={loading}
        className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-blue px-7 text-base font-semibold text-white transition-colors hover:bg-blue/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Se rezervă…" : "Rezervă (30 de minute)"}
      </button>
      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
