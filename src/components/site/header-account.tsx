"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { displayName } from "@/lib/user-display";

export function HeaderAccount({ lang }: { lang: "ro" | "en" }) {
  const { data } = useSession();
  const user = data?.user;

  if (!user) {
    return (
      <Link
        href="/login"
        className="text-sm font-medium text-asphalt/80 transition-colors hover:text-blue"
      >
        {lang === "ro" ? "Autentificare" : "Sign in"}
      </Link>
    );
  }

  const name = displayName(user);
  return (
    <Link
      href="/account"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-asphalt transition-colors hover:text-blue"
    >
      <span
        aria-hidden
        className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-asphalt text-[0.7rem] font-bold leading-none text-paper"
      >
        {name.charAt(0).toUpperCase()}
      </span>
      <span className="hidden max-w-[14ch] truncate sm:inline">{name}</span>
    </Link>
  );
}
