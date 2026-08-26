"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/server/actions/auth";
import { AuthShell, fieldClass, primaryBtn } from "@/components/auth/auth-shell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await forgotPasswordAction({ email });
    setLoading(false);
    if (res.ok) setDone(true);
    else setError(res.error);
  }

  if (done) {
    return (
      <AuthShell title="Verifică-ți e-mailul">
        <p className="text-sm leading-relaxed text-foreground/80">
          Dacă există un cont cu această adresă, ți-am trimis un link pentru resetarea
          parolei. Linkul este valabil o oră.
        </p>
        <Link href="/login" className="mt-6 inline-block text-sm text-blue underline-offset-2 hover:underline">
          Mergi la autentificare
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Resetare parolă" subtitle="Îți trimitem un link pentru a-ți seta o parolă nouă.">
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className={fieldClass}
          type="email"
          placeholder="E-mail"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <button type="submit" className={primaryBtn} disabled={loading}>
          {loading ? "Se trimite…" : "Trimite linkul"}
        </button>
      </form>
      <Link href="/login" className="mt-4 inline-block text-sm text-blue underline-offset-2 hover:underline">
        Înapoi la autentificare
      </Link>
    </AuthShell>
  );
}
