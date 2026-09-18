"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const customerItems = [
  { href: "/account", label: "Detalii" },
  { href: "/account/orders", label: "Comenzi" },
  { href: "/account/returns", label: "Retururile mele" },
  { href: "/account/preferences", label: "Preferințe" },
  { href: "/account/security", label: "Securitate" },
];

const vouchersItem = { href: "/account/vouchers", label: "Vouchere" };

const staffItems = [
  { href: "/account", label: "Detalii" },
  { href: "/account/security", label: "Securitate" },
];

// A partner does its job from here (no separate panel): a tab to scan vouchers.
const partnerItems = [
  { href: "/account", label: "Detalii" },
  { href: "/account/scan", label: "Scanare vouchere" },
  { href: "/account/security", label: "Securitate" },
];

export function AccountNav({
  role,
  hasVouchers = false,
}: {
  role: "customer" | "admin" | "workshop" | "partner";
  hasVouchers?: boolean;
}) {
  const path = usePathname();
  const base = role === "customer" ? customerItems : role === "partner" ? partnerItems : staffItems;
  // The recipient "Vouchere" tab shows for any account that actually holds
  // vouchers (a workshop/partner can also be a recipient). Placed after Detalii.
  const items = hasVouchers ? [base[0], vouchersItem, ...base.slice(1)] : base;
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
