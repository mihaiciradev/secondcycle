"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/use-cart";

export function BasketLink() {
  const { count } = useCart();
  return (
    <Link
      href="/cart"
      aria-label={count > 0 ? `Coș (${count})` : "Coș"}
      className="relative inline-flex items-center rounded-sm text-foreground/75 transition-colors hover:text-foreground"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="size-6" aria-hidden>
        <circle cx="8" cy="20" r="1.4" />
        <circle cx="18" cy="20" r="1.4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 3.5h2.2l2 11.2a1.6 1.6 0 0 0 1.6 1.3h8.4a1.6 1.6 0 0 0 1.6-1.3l1.3-7H6" />
      </svg>
      {count > 0 ? (
        <span className="absolute -right-2 -top-1.5 inline-flex min-w-[1.05rem] items-center justify-center rounded-full bg-blue px-1 text-[0.65rem] font-bold leading-tight text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
