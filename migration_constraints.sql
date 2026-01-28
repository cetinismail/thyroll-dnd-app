-- Add unique constraints to allow UPSERT operations
ALTER TABLE public.spells ADD CONSTRAINT spells_name_key UNIQUE (name);
ALTER TABLE public.monsters ADD CONSTRAINT monsters_name_key UNIQUE (name);
ALTER TABLE public.items ADD CONSTRAINT items_name_key UNIQUE (name);
