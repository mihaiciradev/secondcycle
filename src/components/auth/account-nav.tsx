"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/account", label: "Detalii" },
  { href: "/account/orders", label: "Comenzi" },
  { href: "/account/preferences", label: "Preferințe" },
  { href: "/account/security", label: "Securitate" },
];

export function AccountNav() {
  const path = usePathname();
  const isActive = (href: string) =>
    href === "/account" ? path === "/account" : path.startsWith(href);

  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col md:gap-0.5">
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className={`rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
            isActive(i.href)
              ? "bg-asphalt text-paper"
              : "text-foreground/70 hover:bg-asphalt/5 hover:text-foreground"
          }`}
        >
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
