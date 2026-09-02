import { db } from "@/server/db/client";
import { adminListUsers } from "@/server/services/admin-users";
import { SectionTitle, StatCard } from "@/components/admin/dashboard-ui";
import { CopyButton } from "@/components/admin/copy-button";
import { PromoteUserButton } from "@/components/admin/promote-user-button";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const roleLabel: Record<string, string> = {
  customer: "Client",
  admin: "Admin",
  workshop: "Atelier",
};

export default async function AdminUsersPage() {
  const users = await adminListUsers(db);
  const subscribed = users.filter((u) => u.marketingOptIn);
  const subscribedEmails = subscribed.map((u) => u.email).join("\n");
  const allEmails = users.map((u) => u.email).join("\n");

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Utilizatori" value={users.length} />
        <StatCard
          label="Abonați newsletter"
          value={subscribed.length}
          sub={users.length ? `${Math.round((subscribed.length / users.length) * 100)}% din total` : undefined}
          tone="accent"
        />
        <StatCard
          label="E-mail confirmat"
          value={users.filter((u) => u.emailVerifiedAt).length}
        />
        <StatCard label="Clienți" value={users.filter((u) => u.role === "customer").length} />
      </div>

      <section>
        <SectionTitle hint="pentru campanii de e-mail">Export rapid</SectionTitle>
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
          <CopyButton
            text={subscribedEmails}
            label={`Copiază e-mailuri abonate (${subscribed.length})`}
            emptyLabel="Niciun abonat"
          />
          <CopyButton text={allEmails} label={`Copiază toate e-mailurile (${users.length})`} />
          <span className="text-xs text-steel">Se copiază câte o adresă pe linie.</span>
        </div>
      </section>

      <section>
        <SectionTitle hint={`${users.length} conturi`}>Utilizatori</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left font-mono text-xs uppercase tracking-wider text-steel">
                <th className="py-2 pr-4">E-mail</th>
                <th className="py-2 pr-4">Rol</th>
                <th className="py-2 pr-4">Confirmat</th>
                <th className="py-2 pr-4">Newsletter</th>
                <th className="py-2 pr-4">Înregistrat</th>
                <th className="py-2">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border/70">
                  <td className="py-2.5 pr-4">{u.email}</td>
                  <td className="py-2.5 pr-4">{roleLabel[u.role] ?? u.role}</td>
                  <td className="py-2.5 pr-4">
                    {u.emailVerifiedAt ? (
                      <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400">da</span>
                    ) : (
                      <span className="font-mono text-xs text-steel">nu</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4">
                    {u.marketingOptIn ? (
                      <span className="rounded-full bg-blue/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-blue">
                        abonat
                      </span>
                    ) : (
                      <span className="font-mono text-xs text-steel">-</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-xs text-steel">
                    {new Date(u.createdAt).toLocaleDateString("ro-RO")}
                  </td>
                  <td className="py-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <CopyButton text={u.email} label="Copiază e-mail" size="sm" />
                      {u.role === "customer" ? <PromoteUserButton email={u.email} /> : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
