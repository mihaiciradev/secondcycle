"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

  async function retry() {
    setLoading(true);
    await retryInvoiceAction(orderId);
    setLoading(false);
    router.refresh();
  }

  const badge =
    status === "ok"
      ? "bg-lime text-asphalt"
      : status === "error"
        ? "bg-red-500/15 text-red-600 dark:text-red-400"
        : "bg-asphalt/10 text-steel";
  const label = status === "ok" ? "Emisă" : status === "error" ? "Eroare" : "Neemisă";

  return (
    <div className="flex items-center gap-2">
      <span className={`rounded px-2 py-0.5 font-mono text-[0.65rem] ${badge}`} title={info ?? undefined}>
        {label}
      </span>
      {status !== "ok" ? (
        <button
          type="button"
          onClick={retry}
          disabled={loading}
          className="cursor-pointer font-mono text-[0.65rem] text-blue underline-offset-2 hover:underline disabled:opacity-60"
        >
          {loading ? "…" : "reemite"}
        </button>
      ) : null}
    </div>
  );
}
