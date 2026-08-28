import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = { title: "Coșul tău" };

export default function CartPage() {
  return (
    <>
      <SiteHeader />
      <main id="continut" className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-14">
          <h1 className="text-3xl font-bold tracking-tight">Coșul tău</h1>
          <CartView />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
