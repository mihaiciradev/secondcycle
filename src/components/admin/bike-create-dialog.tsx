"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BikeCreateForm } from "@/components/admin/bike-create-form";

/** Bikes are added rarely, so intake lives behind a button rather than a
    permanent form at the top of the page. */
export function BikeCreateDialog({ workshops }: { workshops: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="default" size="lg">
            <PlusIcon />
            Adaugă bicicletă
          </Button>
        }
      />
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adaugă o bicicletă</DialogTitle>
          <DialogDescription>
            Se creează ca ciornă. Prețul final, descrierea și „ce am făcut” se completează după fișa
            atelierului, la publicare.
          </DialogDescription>
        </DialogHeader>
        <BikeCreateForm workshops={workshops} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
