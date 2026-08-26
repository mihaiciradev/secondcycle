"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPasswordAction } from "@/server/actions/auth";
import { AuthShell, fieldClass, primaryBtn } from "@/components/auth/auth-shell";

function ResetForm() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await resetPasswordAction({ token, password });
    setLoading(false);
    if (res.ok) setDone(true);
    else setError(res.error);
  }

  if (!token) {
    return <p className="text-sm text-destructive">Link invalid. Cere din nou resetarea parolei.</p>;
  }
  if (done) {
    return (
      <>
        <p className="text-sm leading-relaxed text-foreground/80">
          Parola a fost schimbată. Te poți autentifica cu noua parolă.
        </p>
        <Link href="/login" className="mt-6 inline-block text-sm text-blue underline-offset-2 hover:underline">
          Mergi la autentificare
        </Link>
      </>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        className={fieldClass}
        type="password"
        placeholder="Parolă nouă (minim 10 caractere)"
        autoComplete="new-password"
        required
        minLength={10}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <button type="submit" className={primaryBtn} disabled={loading}>
        {loading ? "Se salvează…" : "Setează parola"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Parolă nouă">
      <Suspense fallback={null}>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}
