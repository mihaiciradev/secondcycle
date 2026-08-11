import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Hero } from "@/components/sections/hero";
import { TrustBar } from "@/components/sections/trust-bar";
import { HowBuying } from "@/components/sections/how-buying";
import { HowSelling } from "@/components/sections/how-selling";
import { Inspection } from "@/components/sections/inspection";
import { RepairTiers } from "@/components/sections/repair-tiers";
import { YourRights } from "@/components/sections/your-rights";

export default function Home() {
  return (
    <>
      <a
        href="#continut"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-asphalt focus:px-4 focus:py-2 focus:text-sm focus:text-paper"
      >
        Sari la conținut
      </a>
      <SiteHeader />
      <main id="continut" className="flex-1">
        <Hero />
        <TrustBar />
        <HowBuying />
        <HowSelling />
        <Inspection />
        <RepairTiers />
        <YourRights />
      </main>
      <SiteFooter />
    </>
  );
}
