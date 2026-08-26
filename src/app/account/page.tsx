import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/server/db/client";
import { getUserById } from "@/server/services/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { AccountActions } from "@/components/auth/account-actions";

export const runtime = "nodejs";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-3">
      <dt className="font-mono text-xs uppercase tracking-[0.12em] text-steel">{label}</dt>
      <dd className="text-sm text-foreground/90">{value}</dd>
    </div>
  );
}

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await getUserById(db, session.user.id);
  if (!user) redirect("/login");

  return (
    <AuthShell title="Contul tău">
      <dl className="mb-8 border-t border-border">
        <Row label="E-mail" value={user.email} />
        <Row label="Rol" value={user.role === "admin" ? "Administrator" : "Client"} />
        <Row label="E-mail confirmat" value={user.emailVerifiedAt ? "Da" : "Nu"} />
      </dl>
      <AccountActions initialOptIn={user.marketingOptIn} />
    </AuthShell>
  );
}
