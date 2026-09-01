-- Revolut Pay support: store the Revolut Merchant order id on our order. Additive.
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "revolut_order_id" text;
