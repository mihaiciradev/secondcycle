"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AuthShell,
  fieldClass,
  labelClass,
  outlineBtn,
  primaryBtn,
} from "@/components/auth/auth-shell";
import { GoogleIcon } from "@/components/auth/google-icon";

function Divider() {
  return (
    <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-steel">
      <span className="h-px flex-1 bg-border" />
      sau cu e-mail
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const verified = params.get("verified") === "1";
  const next = params.get("next") || "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError("E-mail sau parolă greșite, ori contul nu e confirmat.");
    else router.push(next);
  }

  return (
    <>
      {verified ? (
        <p className="mb-5 rounded-md border border-blue/25 bg-blue/5 px-3.5 py-2.5 text-sm text-blue">
          Adresa de e-mail a fost confirmată. Autentifică-te ca să continui.
        </p>
      ) : null}

      <button
        type="button"
        className={outlineBtn}
        onClick={() => signIn("google", { callbackUrl: next })}
      >
        <GoogleIcon />
        Continuă cu Google
      </button>

      <Divider />

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
          <div className="mb-1.5 flex items-baseline justify-between">
            <label htmlFor="password" className="text-sm font-medium text-foreground/80">
              Parolă
            </label>
            <Link href="/forgot-password" className="text-xs text-blue underline-offset-2 hover:underline">
              Ai uitat parola?
            </Link>
          </div>
          <input
            id="password"
            className={fieldClass}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <button type="submit" className={primaryBtn} disabled={loading}>
          {loading ? "Se verifică…" : "Autentificare"}
        </button>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Bine ai revenit"
      subtitle="Intră în cont ca să rezervi o bicicletă și să-ți urmărești comanda."
      footer={
        <>
          Nu ai cont?{" "}
          <Link href="/register" className="font-medium text-blue underline-offset-2 hover:underline">
            Creează unul
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
