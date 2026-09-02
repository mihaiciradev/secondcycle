-- Returns (14-day right of withdrawal) + a string payload on app_settings.

-- app_settings gains an optional string value, for non-boolean settings such as
-- the returns notification email. Boolean settings keep using "enabled".
ALTER TABLE "app_settings" ADD COLUMN IF NOT EXISTS "value" text;

DO $$ BEGIN
  CREATE TYPE "return_status" AS ENUM ('pending', 'handled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "return_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "contact_name" text NOT NULL,
  "contact_email" citext NOT NULL,
  "contact_phone" text,
  "items" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "reason" text,
  "status" "return_status" NOT NULL DEFAULT 'pending',
  "handled_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "return_requests_status_idx" ON "return_requests" ("status");
