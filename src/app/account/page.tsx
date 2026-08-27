import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/server/db/client";
import { getUserById } from "@/server/services/auth";
import { Card, Row } from "@/components/auth/account-ui";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AccountDetailsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await getUserById(db, session.user.id);
  if (!user) redirect("/login");

  return (
    <Card title="Detalii cont">
      <dl>
        <Row label="E-mail">{user.email}</Row>
        <Row label="Tip cont">{user.role === "admin" ? "Administrator" : "Client"}</Row>
        <Row label="E-mail confirmat">
          {user.emailVerifiedAt ? (
            <span className="rounded bg-lime px-2 py-0.5 font-mono text-xs text-asphalt">Confirmat</span>
          ) : (
            <span className="rounded bg-asphalt/10 px-2 py-0.5 font-mono text-xs text-steel">Neconfirmat</span>
          )}
        </Row>
      </dl>
      {user.role === "admin" ? (
        <Link
          href="/admin/bikes"
          className="mt-5 inline-flex text-sm font-medium text-blue underline-offset-2 hover:underline"
        >
          Deschide panoul de administrare
        </Link>
      ) : null}
    </Card>
  );
}
