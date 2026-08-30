import type { Metadata } from "next";
import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { CookieNotice } from "@/components/site/cookie-notice";
import { SITE_URL } from "@/lib/content/site";

// Archivo is a variable font; the Plex families need explicit weights.
// latin-ext covers the Romanian diacritics ă â î ș ț.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Second Cycle: biciclete second-hand reparate și cu garanție",
    template: "%s | Second Cycle",
  },
  description:
    "Cumperi o bicicletă second-hand verificată piesă cu piesă, cu acte, garanție 12 luni și retur în 14 zile. O reparăm și ne punem numele pe ea. Livrare în toată România, atelier în Timișoara.",
  applicationName: "Second Cycle",
  keywords: [
    "biciclete second-hand",
    "biciclete second hand Timișoara",
    "biciclete reparate cu garanție",
    "biciclete de vânzare",
    "MTB second-hand",
    "biciclete oraș",
    "biciclete cursiere",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: SITE_URL,
    siteName: "Second Cycle",
    title: "Second Cycle: biciclete second-hand reparate și cu garanție",
    description:
      "Le alegem, le reparăm și ți le vindem cu acte, garanție 12 luni și retur în 14 zile. Vezi exact ce am reparat la fiecare, înainte să plătești.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Second Cycle: biciclete second-hand reparate și cu garanție",
    description:
      "Biciclete second-hand verificate piesă cu piesă, cu acte și garanție. Livrare în toată România.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ro"
      className={`${archivo.variable} ${plexSans.variable} ${plexMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        <CookieNotice />
      </body>
    </html>
  );
}
