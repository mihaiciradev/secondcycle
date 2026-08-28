"use client";

import { useState } from "react";
import { createCheckoutAction } from "@/server/actions/orders";

export function PayButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setLoading(true);
    setError(null);
    const res = await createCheckoutAction(orderId);
    if (res.ok) {
      window.location.href = res.url;
      return;
    }
    setLoading(false);
    setError(res.error);
  }

  return (
    <div>
      <button
        type="button"
        onClick={pay}
        disabled={loading}
        className="inline-flex h-11 cursor-pointer items-center rounded-full bg-blue px-6 text-sm font-semibold text-white transition-colors hover:bg-blue/90 disabled:opacity-60"
      >
        {loading ? "Se deschide plata…" : "Plătește"}
      </button>
      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
