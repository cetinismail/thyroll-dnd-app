-- Add starting_equipment to classes
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS starting_equipment jsonb;
