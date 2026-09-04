-- Bike "year" becomes free text so it can hold a range/estimate for uncertain
-- bikes ("2018-2020", "~2015"), not just an exact integer year.
ALTER TABLE "bikes" ALTER COLUMN "model_year" TYPE text USING "model_year"::text;
