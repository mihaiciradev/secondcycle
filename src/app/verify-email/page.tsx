import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <AuthShell title={error ? "Link invalid" : "Confirmă-ți e-mailul"}>
      <p className="text-sm leading-relaxed text-foreground/80">
        {error
          ? "Linkul de confirmare este invalid sau a expirat. Autentifică-te ca să primești unul nou."
          : "Ți-am trimis un e-mail de confirmare. Deschide linkul din e-mail ca să îți activezi contul."}
      </p>
      <Link
        href="/login"
        className="mt-6 inline-block text-sm text-blue underline-offset-2 hover:underline"
      >
        Mergi la autentificare
      </Link>
    </AuthShell>
  );
}
