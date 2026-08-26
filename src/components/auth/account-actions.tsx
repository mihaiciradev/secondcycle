"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import { toggleMarketingAction } from "@/server/actions/auth";
import { outlineBtn } from "@/components/auth/auth-shell";

export function AccountActions({ initialOptIn }: { initialOptIn: boolean }) {
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
    <div className="space-y-6">
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          className="mt-0.5 size-4 accent-[color:var(--color-blue)]"
          checked={optIn}
          onChange={toggle}
          disabled={pending}
        />
        <span className="text-foreground/80">Vreau să primesc noutăți pe e-mail</span>
      </label>

      <button type="button" className={outlineBtn} onClick={() => signOut({ callbackUrl: "/" })}>
        Deconectare
      </button>
    </div>
  );
}
