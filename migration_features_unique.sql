
-- Add unique constraint to features name to allow upsert
ALTER TABLE public.features ADD CONSTRAINT features_name_key UNIQUE (name);
