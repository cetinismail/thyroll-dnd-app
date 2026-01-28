-- Add currency column to characters
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS currency jsonb DEFAULT '{"gp": 0, "sp": 0, "cp": 0}';
