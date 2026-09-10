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
import { WorkshopCreateForm } from "@/components/admin/workshop-create-form";

/** New workshops are added rarely, so creation lives behind a button. */
export function WorkshopCreateDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="default" size="lg">
            <PlusIcon />
            Adaugă atelier
          </Button>
        }
      />
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adaugă un atelier</DialogTitle>
          <DialogDescription>
            Creează un cont de atelier nou. Ca să transformi un client existent în atelier, folosește
            „Fă atelier” din pagina Utilizatori.
          </DialogDescription>
        </DialogHeader>
        <WorkshopCreateForm onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
