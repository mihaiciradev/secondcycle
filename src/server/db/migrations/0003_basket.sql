-- Basket / multi-item orders + notify-me. EXPAND-ONLY (non-destructive):
-- old single-bike columns on `orders` are kept (nullable) so any still-deployed
-- old code keeps working. A later contract migration drops them once new code
-- is live everywhere.

-- 1. Line items: a basket becomes one order with several items. --------------
CREATE TABLE IF NOT EXISTS "order_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "bike_id" uuid NOT NULL REFERENCES "bikes"("id") ON DELETE RESTRICT,
  "brand" text NOT NULL,
  "model" text NOT NULL,
  "sku" text NOT NULL,
  "price_cents" integer NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "order_items_order_bike_uq"
  ON "order_items" ("order_id", "bike_id");

-- 2. Notify-me watchers on reserved bikes. -----------------------------------
CREATE TABLE IF NOT EXISTS "bike_watchers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "bike_id" uuid NOT NULL REFERENCES "bikes"("id") ON DELETE CASCADE,
  "email" citext NOT NULL,
  "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "notified_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "bike_watchers_bike_email_pending_uq"
  ON "bike_watchers" ("bike_id", "email") WHERE "notified_at" IS NULL;

-- 3. Holds are now created at checkout and tied to their order. --------------
ALTER TABLE "reservations"
  ADD COLUMN IF NOT EXISTS "order_id" uuid REFERENCES "orders"("id") ON DELETE SET NULL;

-- A user may now hold several bikes at once (one per basket item), so the
-- one-active-hold-per-user guard is removed. One-per-bike stays.
DROP INDEX IF EXISTS "reservations_user_active_uq";

-- 4. Relax the old single-bike order columns so new inserts may omit them. ----
ALTER TABLE "orders" ALTER COLUMN "bike_id" DROP NOT NULL;
ALTER TABLE "orders" ALTER COLUMN "bike_price_cents" DROP NOT NULL;

-- 5. Backfill: turn every existing single-bike order into one line item. ------
INSERT INTO "order_items" ("order_id", "bike_id", "brand", "model", "sku", "price_cents")
SELECT o."id", o."bike_id", b."brand", b."model", b."sku", o."bike_price_cents"
FROM "orders" o
JOIN "bikes" b ON b."id" = o."bike_id"
WHERE o."bike_id" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "order_items" oi WHERE oi."order_id" = o."id");
