-- Notițe pentru atelier: ca "notițe interne", dar vizibile atelierelor
-- (în pagina lor de bicicletă) și pe pagina privată de evaluare a mecanicului.
-- Ne ajută să spunem lucruri utile despre bicicletă celor care o evaluează.

ALTER TABLE "bikes" ADD COLUMN IF NOT EXISTS "workshop_notes" text;
