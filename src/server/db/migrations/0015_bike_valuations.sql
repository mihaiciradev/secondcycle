-- Evaluări externe de preț: link privat (capability URL) trimis unui mecanic,
-- cu sau fără cont, care ne dă o părere de preț pentru o bicicletă anume.
-- Neindexabil; fiecare link generat = un slot de opinie, legat de bicicletă.

CREATE TABLE IF NOT EXISTS "bike_valuations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "bike_id" uuid NOT NULL REFERENCES "bikes"("id") ON DELETE CASCADE,
  "token" text NOT NULL UNIQUE,
  "suggested_name" text,
  "respondent_name" text,
  "market_value_cents" integer,
  "suggested_spend_cents" integer,
  "not_worth" boolean NOT NULL DEFAULT false,
  "notes" text,
  "submitted_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "bike_valuations_bike_idx" ON "bike_valuations" ("bike_id");
