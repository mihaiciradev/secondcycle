"use client";

import { useState } from "react";

export function CopyButton({
  text,
  label,
  emptyLabel,
  size = "md",
}: {
  text: string;
  label: string;
  emptyLabel?: string;
  size?: "sm" | "md";
}) {
  const [copied, setCopied] = useState(false);
  const disabled = text.length === 0;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked (insecure context) — select-and-copy fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        /* give up silently */
      }
      ta.remove();
    }
  }

  const cls =
    size === "sm"
      ? "h-7 px-2.5 text-xs"
      : "h-9 px-4 text-sm";

  return (
    <button
      type="button"
      onClick={copy}
      disabled={disabled}
      className={`inline-flex ${cls} cursor-pointer items-center gap-1.5 rounded-full border border-border font-medium transition-colors hover:border-asphalt/50 disabled:cursor-not-allowed disabled:opacity-50 ${
        copied ? "border-emerald-500/50 text-emerald-600 dark:text-emerald-400" : "text-foreground/80"
      }`}
    >
      {copied ? "Copiat ✓" : disabled && emptyLabel ? emptyLabel : label}
    </button>
  );
}
