import type { Metadata } from "next";
import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

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
  metadataBase: new URL("https://www.second-cycle.ro"),
  title: {
    default: "Second Cycle: biciclete second-hand, reparate și garantate",
    template: "%s | Second Cycle",
  },
  description:
    "Cumperi o bicicletă second-hand cu acte, garanție și drept de retur de 14 zile. O verificăm, o reparăm și ne punem numele pe ea. Timișoara.",
  applicationName: "Second Cycle",
  openGraph: {
    type: "website",
    locale: "ro_RO",
    siteName: "Second Cycle",
    title: "Second Cycle: biciclete second-hand, reparate și garantate",
    description:
      "Încrederea unui atelier la un preț apropiat de o vânzare între persoane. Acte, garanție, retur în 14 zile.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ro"
      className={`${archivo.variable} ${plexSans.variable} ${plexMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
