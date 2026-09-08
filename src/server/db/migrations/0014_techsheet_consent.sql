-- Fișa tehnică structurată pe bicicletă + snapshot imutabil al consimțământului
-- (Bifa 2) pe fiecare linie de comandă (dovada acordului per bicicletă).

ALTER TABLE "bikes" ADD COLUMN IF NOT EXISTS "tech_sheet" jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "consent_text" text;
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "tech_sheet_snapshot" jsonb;
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "warranty_months" integer;
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "consent_accepted_at" timestamptz;
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "consent_ip" inet;
