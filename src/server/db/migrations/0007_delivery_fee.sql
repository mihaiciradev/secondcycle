-- Courier delivery fee on orders (included in total_cents). Additive.
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delivery_fee_cents" integer NOT NULL DEFAULT 0;
