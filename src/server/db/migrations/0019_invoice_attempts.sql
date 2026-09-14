-- Istoricul complet al încercărilor de facturare SoftPro (prima automată, apoi
-- orice reemite), ca să nu se piardă cererea/răspunsul primei încercări când se
-- reemite. Doar intern.

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "sp_invoice_attempts" jsonb NOT NULL DEFAULT '[]'::jsonb;
