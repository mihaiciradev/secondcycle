"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelOrderAction } from "@/server/actions/orders";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    if (!window.confirm("Anulezi comanda? Bicicleta revine în stoc.")) return;
    setLoading(true);
    setError(null);
    const res = await cancelOrderAction(orderId);
    setLoading(false);
    if (res.ok) router.refresh();
    else setError(res.error);
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={cancel}
        disabled={loading}
        className="cursor-pointer text-sm text-steel underline-offset-2 hover:text-destructive hover:underline disabled:opacity-60"
      >
        {loading ? "Se anulează…" : "Renunță la comandă"}
      </button>
      {error ? <p className="mt-1 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
