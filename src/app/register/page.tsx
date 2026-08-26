"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { registerAction } from "@/server/actions/auth";
import { AuthShell, fieldClass, outlineBtn, primaryBtn } from "@/components/auth/auth-shell";
import { GoogleIcon } from "@/components/auth/google-icon";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await registerAction({ email, password });
    setLoading(false);
    if (res.ok) setDone(true);
    else setError(res.error);
  }

  if (done) {
    return (
      <AuthShell title="Verifică-ți e-mailul">
        <p className="text-sm leading-relaxed text-foreground/80">
          Dacă adresa este validă, ți-am trimis un link de confirmare. Deschide-l ca
          să îți activezi contul, apoi autentifică-te.
        </p>
        <Link href="/login" className="mt-6 inline-block text-sm text-blue underline-offset-2 hover:underline">
          Mergi la autentificare
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Creează cont" subtitle="Îți faci cont ca să rezervi o bicicletă și să-ți urmărești comanda.">
      <button
        type="button"
        className={outlineBtn}
        onClick={() => signIn("google", { callbackUrl: "/account" })}
      >
        <GoogleIcon />
        Continuă cu Google
      </button>

      <div className="my-5 flex items-center gap-3 text-xs text-steel">
        <span className="h-px flex-1 bg-border" /> sau <span className="h-px flex-1 bg-border" />
      </div>

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
        <input
          className={fieldClass}
          type="password"
          placeholder="Parolă (minim 10 caractere)"
          autoComplete="new-password"
          required
          minLength={10}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <button type="submit" className={primaryBtn} disabled={loading}>
          {loading ? "Se creează…" : "Creează cont"}
        </button>
      </form>

      <p className="mt-4 text-sm">
        Ai deja cont?{" "}
        <Link href="/login" className="text-blue underline-offset-2 hover:underline">
          Autentifică-te
        </Link>
      </p>
    </AuthShell>
  );
}
