import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/server/db/client";
import { getUserById } from "@/server/services/auth";
import { company } from "@/lib/content/site";
import { Card } from "@/components/auth/account-ui";
import { LogoutButton } from "@/components/auth/account-actions";
import { DeleteAccount } from "@/components/auth/delete-account";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AccountSecurityPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await getUserById(db, session.user.id);
  if (!user) redirect("/login");
  const canDelete = user.role === "customer";

  return (
    <div className="space-y-4">
      <Card title="Parolă">
        <p className="text-sm text-foreground/70">
          Îți trimitem un link pe e-mail pentru a-ți seta o parolă nouă.
        </p>
        <Link
          href="/forgot-password"
          className="mt-4 inline-flex text-sm font-medium text-blue underline-offset-2 hover:underline"
        >
          Schimbă parola
        </Link>
      </Card>

      <Card title="Sesiune">
        <LogoutButton />
      </Card>

      <Card title="Șterge contul">
        {canDelete ? (
          <DeleteAccount />
        ) : (
          <p className="text-sm leading-relaxed text-foreground/70">
            Contul de {user.role === "workshop" ? "atelier" : "administrator"} nu poate fi
            șters din aplicație. Scrie-ne la{" "}
            <a href={`mailto:${company.contact.email}`} className="text-blue underline-offset-2 hover:underline">
              {company.contact.email}
            </a>{" "}
            și ne ocupăm noi.
          </p>
        )}
      </Card>
    </div>
  );
}
