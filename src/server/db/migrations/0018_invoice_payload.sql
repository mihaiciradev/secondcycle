-- Urmărire facturi SoftPro: păstrăm exact ce trimitem (payload JSON) și ce
-- primim (răspuns brut), ca să putem verifica/depana cifrele (ex. TVA la marjă)
-- direct din admin. Doar intern.

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "sp_invoice_request" text;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "sp_invoice_response" text;
