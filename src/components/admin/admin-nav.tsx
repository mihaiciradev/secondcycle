"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Sumar", exact: true },
  { href: "/admin/bikes", label: "Biciclete" },
  { href: "/admin/workshops", label: "Ateliere" },
  { href: "/admin/orders", label: "Comenzi" },
  { href: "/admin/returns", label: "Retururi" },
  { href: "/admin/users", label: "Utilizatori" },
  { href: "/admin/settings", label: "Setări" },
];

export function AdminNav({ badges = {} }: { badges?: Record<string, number> }) {
  const path = usePathname();
  return (
    <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-border">
      {items.map((i) => {
        const active = i.exact ? path === i.href : path.startsWith(i.href);
        const badge = badges[i.href] ?? 0;
        return (
          <Link
            key={i.href}
            href={i.href}
            className={`-mb-px flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
              active
                ? "border-asphalt text-asphalt"
                : "border-transparent text-foreground/60 hover:text-foreground"
            }`}
          >
            {i.label}
            {badge > 0 ? (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[0.65rem] font-bold text-white">
                {badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
