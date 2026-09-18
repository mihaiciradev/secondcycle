"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { assignVoucherAction, resendVoucherEmailAction } from "@/server/actions/admin/vouchers";
import { fieldClass } from "@/components/auth/auth-shell";

/** Per-voucher admin control: assign to a recipient e-mail (+ send), or resend. */
export function VoucherAssign({
  voucherId,
  recipientEmail,
}: {
  voucherId: string;
  recipientEmail: string | null;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function assign(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNote(null);
    const res = await assignVoucherAction({ voucherId, recipientEmail: email.trim() });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      setError(res.error);
    }
  }

  async function resend() {
    setLoading(true);
    setError(null);
    setNote(null);
    const res = await resendVoucherEmailAction(voucherId);
    setLoading(false);
    if (res.ok) setNote("E-mail retrimis ✓");
    else setError(res.error);
  }

  if (recipientEmail) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs text-foreground/80">{recipientEmail}</span>
        <button
          type="button"
          onClick={resend}
          disabled={loading}
          className="w-fit cursor-pointer font-mono text-[0.65rem] text-blue underline-offset-2 hover:underline disabled:opacity-60"
        >
          {loading ? "…" : "retrimite e-mail"}
        </button>
        {note ? <span className="text-[0.65rem] text-emerald-600 dark:text-emerald-400">{note}</span> : null}
        {error ? <span className="text-[0.65rem] text-destructive">{error}</span> : null}
      </div>
    );
  }

  return (
    <form onSubmit={assign} className="flex flex-col gap-1">
      <div className="flex gap-1.5">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e-mail cont"
          required
          className={`${fieldClass} h-8 w-40 text-xs`}
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-8 shrink-0 cursor-pointer items-center rounded-full bg-asphalt px-3 text-xs font-semibold text-paper transition-colors hover:bg-asphalt/90 disabled:opacity-60"
        >
          {loading ? "…" : "Alocă"}
        </button>
      </div>
      {error ? <span className="text-[0.65rem] text-destructive">{error}</span> : null}
    </form>
  );
}
