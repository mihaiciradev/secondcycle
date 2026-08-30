"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { registerAction } from "@/server/actions/auth";
import {
  AuthShell,
  fieldClass,
  labelClass,
  outlineBtn,
  primaryBtn,
} from "@/components/auth/auth-shell";
import { GoogleIcon } from "@/components/auth/google-icon";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Unchecked by default: GDPR/ePrivacy requires opt-in to be an affirmative act.
  const [newsletter, setNewsletter] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await registerAction({ email, password, marketingOptIn: newsletter });
    setLoading(false);
    if (res.ok) setDone(true);
    else setError(res.error);
  }

  if (done) {
    return (
      <AuthShell title="Verifică-ți e-mailul">
        <p className="text-sm leading-relaxed text-foreground/80">
          Ți-am trimis un link de confirmare la <span className="font-medium">{email}</span>.
          Deschide-l ca să îți activezi contul, apoi autentifică-te.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex text-sm font-medium text-blue underline-offset-2 hover:underline"
        >
          Mergi la autentificare
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Creează-ți contul"
      subtitle="Rezervă bicicleta, urmărește comanda și ține actele la un loc."
      footer={
        <>
          Ai deja cont?{" "}
          <Link href="/login" className="font-medium text-blue underline-offset-2 hover:underline">
            Autentifică-te
          </Link>
        </>
      }
    >
      <button
        type="button"
        className={outlineBtn}
        onClick={() => signIn("google", { callbackUrl: "/account" })}
      >
        <GoogleIcon />
        Continuă cu Google
      </button>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-steel">
        <span className="h-px flex-1 bg-border" />
        sau cu e-mail
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className={labelClass}>
            E-mail
          </label>
          <input
            id="email"
            className={fieldClass}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password" className={labelClass}>
            Parolă
          </label>
          <input
            id="password"
            className={fieldClass}
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="mt-1.5 text-xs text-steel">Minim 10 caractere.</p>
        </div>
        <label className="flex items-start gap-3 rounded-lg border border-border bg-card/50 p-3.5 text-sm">
          <input
            type="checkbox"
            checked={newsletter}
            onChange={(e) => setNewsletter(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-[color:var(--color-blue)]"
          />
          <span className="text-foreground/80">
            Vreau bicicletele bune înaintea tuturor. Trimite-mi ocazional noutăți: modele nou intrate
            în stoc și oferte. Fără spam, te poți dezabona oricând.
          </span>
        </label>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <button type="submit" className={primaryBtn} disabled={loading}>
          {loading ? "Se creează…" : "Creează cont"}
        </button>
      </form>
    </AuthShell>
  );
}
