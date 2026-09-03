"use client";

import { useState } from "react";
import { submitPrebookAction } from "@/server/actions/prebookings";

const solidBtn =
  "inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-blue px-7 text-base font-semibold text-white transition-colors hover:bg-blue/90 disabled:cursor-not-allowed disabled:opacity-60";
const inputCls =
  "h-11 w-full rounded-lg border border-border bg-paper px-4 text-sm outline-none focus:border-asphalt/50";

export function PrebookButton({
  bikeId,
  bikeLabel,
  defaultEmail,
}: {
  bikeId: string;
  bikeLabel: string;
  defaultEmail?: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError(null);
    const res = await submitPrebookAction({
      bikeId,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      note: note.trim() || undefined,
    });
    if (res.ok) setState("done");
    else {
      setState("idle");
      setError(res.error);
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300">
        Gata! Ți-am înregistrat interesul pentru <strong>{bikeLabel}</strong>. Te contactăm în curând
        pe <strong>{email}</strong>. Bicicleta rămâne disponibilă pentru toată lumea până atunci.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-blue/25 bg-blue/5 p-4">
      <p className="text-sm text-foreground/80">
        Momentan nu poți cumpăra online. Fă un <strong>prebook</strong>: îți notăm interesul,{" "}
        <strong>nu blocăm bicicleta</strong>, te contactăm și o poți avea în aproximativ o săptămână.
      </p>

      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className={`${solidBtn} mt-4`}>
          Prebook
        </button>
      ) : (
        <form onSubmit={submit} className="mt-4 max-w-sm space-y-2.5">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nume"
            className={inputCls}
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            className={inputCls}
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Telefon (opțional)"
            className={inputCls}
          />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Mesaj (opțional)"
            rows={2}
            className={`${inputCls} h-auto resize-y py-2.5`}
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <button type="submit" disabled={state === "loading"} className={`${solidBtn} w-full`}>
            {state === "loading" ? "Se trimite…" : "Trimite prebook"}
          </button>
        </form>
      )}
    </div>
  );
}
