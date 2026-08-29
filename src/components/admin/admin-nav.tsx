"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Sumar", exact: true },
  { href: "/admin/bikes", label: "Biciclete" },
  { href: "/admin/workshops", label: "Ateliere" },
  { href: "/admin/orders", label: "Comenzi" },
  { href: "/admin/settings", label: "Setări" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-border">
      {items.map((i) => {
        const active = i.exact ? path === i.href : path.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
              active
                ? "border-asphalt text-asphalt"
                : "border-transparent text-foreground/60 hover:text-foreground"
            }`}
          >
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
