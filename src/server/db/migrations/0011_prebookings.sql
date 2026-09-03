-- Prebookings: capture interest in a bike while buying is disabled. Does NOT
-- reserve or hold the bike; it is a lead the shop follows up on.

DO $$ BEGIN
  CREATE TYPE "prebook_status" AS ENUM ('pending', 'contacted');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "prebookings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "bike_id" uuid NOT NULL REFERENCES "bikes"("id") ON DELETE CASCADE,
  "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "name" text NOT NULL,
  "email" citext NOT NULL,
  "phone" text,
  "note" text,
  "status" "prebook_status" NOT NULL DEFAULT 'pending',
  "handled_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "prebookings_status_idx" ON "prebookings" ("status");
CREATE INDEX IF NOT EXISTS "prebookings_bike_idx" ON "prebookings" ("bike_id");
