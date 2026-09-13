-- Prețul de piață din evaluare devine text liber, ca mecanicul să poată pune
-- și un interval (ex. "1400-1600"), nu doar o cifră. Aditiv: coloana veche
-- market_value_cents rămâne pentru părerile deja trimise (fallback la afișare).

ALTER TABLE "bike_valuations" ADD COLUMN IF NOT EXISTS "market_value_text" text;
