import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/server/db/client";
import { getUserById } from "@/server/services/auth";
import { Card } from "@/components/auth/account-ui";
import { MarketingToggle } from "@/components/auth/account-actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AccountPreferencesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await getUserById(db, session.user.id);
  if (!user) redirect("/login");

  return (
    <Card title="Preferințe">
      <MarketingToggle initialOptIn={user.marketingOptIn} />
    </Card>
  );
}
