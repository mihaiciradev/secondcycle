-- Admin-controlled boolean feature flags (e.g. payments_enabled). Additive.
CREATE TABLE IF NOT EXISTS "app_settings" (
  "key" text PRIMARY KEY NOT NULL,
  "enabled" boolean NOT NULL DEFAULT false,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
