-- Run this in Supabase SQL Editor

-- 1. Create Tables (if they don't exist yet - re-running safe due to IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS public.monsters (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  size text,
  type text,
  subtype text,
  alignment text,
  armor_class integer,
  armor_class_desc text,
  hit_points integer,
  hit_dice text,
  speed_json jsonb,
  strength integer,
  dexterity integer,
  constitution integer,
  intelligence integer,
  wisdom integer,
  charisma integer,
  challenge_rating numeric,
  special_abilities_json jsonb,
  actions_json jsonb,
  legendary_actions_json jsonb,
  image_url text,
  translation jsonb, -- Stores Turkish translations e.g. {"name": "Ejderha", "description": "..."}
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  equipment_category text,
  rarity text DEFAULT 'Common',
  cost_desc text,
  weight numeric,
  description text,
  properties_json jsonb,
  image_url text,
  translation jsonb, -- Stores Turkish translations
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add translation column to existing tables if missing
ALTER TABLE public.spells ADD COLUMN IF NOT EXISTS translation jsonb;
ALTER TABLE public.monsters ADD COLUMN IF NOT EXISTS translation jsonb;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS translation jsonb;

-- 3. Enable RLS
ALTER TABLE public.monsters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- 4. Policies
CREATE POLICY "Monsters are viewable by everyone" ON public.monsters FOR SELECT USING (true);
CREATE POLICY "Items are viewable by everyone" ON public.items FOR SELECT USING (true);
