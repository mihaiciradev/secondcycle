-- Bifa 3 (o dată pe comandă): confirmarea generală că bicicletele sunt bunuri
-- second-hand, iar garanția e legată de bicicletă și de starea ei acceptată.
-- Snapshot imutabil al textului + momentul acceptării (IP-ul e terms_accepted_ip).

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "second_hand_ack_text" text;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "second_hand_ack_accepted_at" timestamptz;
