"use client";

import { useState, useTransition } from "react";
import { setPaymentsEnabledAction } from "@/server/actions/admin/settings";

export function PaymentsToggle({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    const next = !on;
    setOn(next); // optimistic
    setError(null);
    start(async () => {
      const res = await setPaymentsEnabledAction(next);
      if (!res.ok) {
        setOn(!next); // revert
        setError(res.error);
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={toggle}
        disabled={pending}
        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors disabled:opacity-60 ${
          on ? "bg-emerald-600" : "bg-asphalt/25"
        }`}
      >
        <span
          className={`inline-block size-5 transform rounded-full bg-white shadow transition-transform ${
            on ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
