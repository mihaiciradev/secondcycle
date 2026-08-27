"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { deleteAccountAction } from "@/server/actions/auth";

export function DeleteAccount() {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function del() {
    setLoading(true);
    setError(null);
    const res = await deleteAccountAction();
    if (res.ok) {
      await signOut({ callbackUrl: "/" });
    } else {
      setLoading(false);
      setError(res.error);
    }
  }

  return (
    <div>
      <p className="text-sm leading-relaxed text-foreground/70">
        Ștergerea contului îți elimină accesul și datele de cont. Comenzile plasate
        se păstrează în scop contabil, conform legii.
      </p>
      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-4 inline-flex h-10 cursor-pointer items-center rounded-full border border-destructive/40 px-5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5"
        >
          Șterge contul
        </button>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={del}
            disabled={loading}
            className="inline-flex h-10 cursor-pointer items-center rounded-full bg-destructive px-5 text-sm font-semibold text-white transition-colors hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Se șterge…" : "Da, șterge definitiv"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="inline-flex h-10 cursor-pointer items-center rounded-full border border-asphalt/20 px-5 text-sm font-medium transition-colors hover:bg-asphalt/5"
          >
            Renunță
          </button>
        </div>
      )}
      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
