-- The consignor (owner) of a bike, a registered user. Additive.
ALTER TABLE "bikes" ADD COLUMN IF NOT EXISTS "owner_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL;
