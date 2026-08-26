"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShell, fieldClass, outlineBtn, primaryBtn } from "@/components/auth/auth-shell";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const verified = params.get("verified") === "1";
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
    if (res?.error) setError("E-mail sau parolă greșite, ori cont neconfirmat.");
    else router.push("/account");
  }

  return (
    <>
      {verified ? (
        <p className="mb-4 rounded border border-blue/30 bg-blue/5 px-3 py-2 text-sm text-blue">
          Adresa de e-mail a fost confirmată. Te poți autentifica.
        </p>
      ) : null}

      <button
        type="button"
        className={outlineBtn}
        onClick={() => signIn("google", { callbackUrl: "/account" })}
      >
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
          placeholder="Parolă"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <button type="submit" className={primaryBtn} disabled={loading}>
          {loading ? "Se verifică…" : "Autentificare"}
        </button>
      </form>

      <div className="mt-4 flex justify-between text-sm">
        <Link href="/forgot-password" className="text-blue underline-offset-2 hover:underline">
          Ai uitat parola?
        </Link>
        <Link href="/register" className="text-blue underline-offset-2 hover:underline">
          Creează cont
        </Link>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <AuthShell title="Autentificare" subtitle="Intră în contul tău Second Cycle.">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
