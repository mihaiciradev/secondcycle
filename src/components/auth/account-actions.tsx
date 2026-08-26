"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import { toggleMarketingAction } from "@/server/actions/auth";

export function MarketingToggle({ initialOptIn }: { initialOptIn: boolean }) {
  const [optIn, setOptIn] = useState(initialOptIn);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !optIn;
    setOptIn(next);
    startTransition(async () => {
      const res = await toggleMarketingAction(next);
      if (!res.ok) setOptIn(!next); // revert on failure
    });
  }

  return (
    <div className="flex items-center justify-between gap-6">
      <div>
        <p className="text-sm font-medium text-foreground">Noutăți pe e-mail</p>
        <p className="mt-0.5 text-sm text-steel">Biciclete noi, ocazional. Fără spam.</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={optIn}
        aria-label="Noutăți pe e-mail"
        onClick={toggle}
        disabled={pending}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
          optIn ? "bg-blue" : "bg-asphalt/20"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
            optIn ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="inline-flex h-10 cursor-pointer items-center rounded-full border border-asphalt/20 px-5 text-sm font-medium transition-colors hover:bg-asphalt/5"
    >
      Deconectare
    </button>
  );
}
