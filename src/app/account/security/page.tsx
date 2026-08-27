import Link from "next/link";
import { Card } from "@/components/auth/account-ui";
import { LogoutButton } from "@/components/auth/account-actions";
import { DeleteAccount } from "@/components/auth/delete-account";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function AccountSecurityPage() {
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
        <DeleteAccount />
      </Card>
    </div>
  );
}
