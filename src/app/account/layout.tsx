import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { AccountNav } from "@/components/auth/account-nav";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <SiteHeader />
      <main id="continut" className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-steel">Cont</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Contul tău</h1>
          <div className="mt-8 grid gap-8 md:grid-cols-[180px_1fr]">
            <AccountNav />
            <div>{children}</div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
