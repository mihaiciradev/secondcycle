"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { demoteWorkshopToCustomerAction } from "@/server/actions/admin/workshops";

/**
 * Demote a workshop back to a customer account. Confirmed in a popup because it
 * changes the account's role and revokes workshop access.
 */
export function DemoteWorkshopButton({
  workshopId,
  workshopName,
  accountEmail,
}: {
  workshopId: string;
  workshopName: string;
  accountEmail: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setLoading(true);
    setError(null);
    const res = await demoteWorkshopToCustomerAction(workshopId);
    setLoading(false);
    if (res.ok) {
      setOpen(false);
      router.refresh();
    } else {
      setError(res.error);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="inline-flex h-7 cursor-pointer items-center rounded-full border border-border px-2.5 text-xs font-medium text-foreground/80 transition-colors hover:border-asphalt/50"
      >
        Fă client
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transformă în client</DialogTitle>
            <DialogDescription>
              Atelierul <span className="font-medium text-foreground">{workshopName}</span>
              {accountEmail ? (
                <>
                  {" "}
                  (cont <span className="font-mono text-foreground/80">{accountEmail}</span>)
                </>
              ) : null}{" "}
              devine cont de client obișnuit și pierde accesul de atelier. Istoricul (biciclete,
              fișe de service) rămâne atribuit atelierului.
            </DialogDescription>
          </DialogHeader>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-9 cursor-pointer items-center rounded-full border border-border px-4 text-sm font-medium text-foreground/80 transition-colors hover:border-asphalt/50"
            >
              Renunță
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={loading}
              className="inline-flex h-9 cursor-pointer items-center rounded-full bg-destructive px-4 text-sm font-semibold text-white transition-colors hover:bg-destructive/90 disabled:opacity-60"
            >
              {loading ? "Se transformă…" : "Transformă în client"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
