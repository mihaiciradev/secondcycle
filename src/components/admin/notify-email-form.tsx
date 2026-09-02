"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setReturnsNotifyEmailAction } from "@/server/actions/admin/settings";
import { fieldClass } from "@/components/auth/auth-shell";

export function NotifyEmailForm({ initial }: { initial: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    const res = await setReturnsNotifyEmailAction(email);
    setLoading(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    } else {
      setError(res.error);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
      <div className="min-w-[240px] flex-1">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setSaved(false);
          }}
          className={fieldClass}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-11 cursor-pointer items-center rounded-full border border-asphalt/25 px-6 text-sm font-semibold text-foreground transition-colors hover:border-asphalt/50 disabled:opacity-60"
      >
        {loading ? "Se salvează…" : "Salvează"}
      </button>
      {saved ? <span className="text-sm text-emerald-600 dark:text-emerald-400">Salvat ✓</span> : null}
      {error ? <p className="w-full text-sm text-destructive">{error}</p> : null}
    </form>
  );
}
