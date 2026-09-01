-- Intake -> constatare -> publish lifecycle. Additive (all new columns nullable).
ALTER TABLE "bikes" ADD COLUMN IF NOT EXISTS "provisional_price_cents" integer;
ALTER TABLE "bikes" ADD COLUMN IF NOT EXISTS "acquisition_cost_cents" integer;

ALTER TABLE "service_records" ADD COLUMN IF NOT EXISTS "market_value_cents" integer;
ALTER TABLE "service_records" ADD COLUMN IF NOT EXISTS "suggested_purchase_cents" integer;
ALTER TABLE "service_records" ADD COLUMN IF NOT EXISTS "estimated_repair_cents" integer;
ALTER TABLE "service_records" ADD COLUMN IF NOT EXISTS "actual_repair_cents" integer;
