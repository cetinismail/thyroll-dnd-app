-- Create character_inventory table
CREATE TABLE IF NOT EXISTS public.character_inventory (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  character_id uuid REFERENCES public.characters(id) ON DELETE CASCADE NOT NULL,
  item_id uuid REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  is_equipped boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.character_inventory ENABLE ROW LEVEL SECURITY;

-- Policies
-- View: Allow if user owns the character
CREATE POLICY "Users can view own character inventory" ON public.character_inventory
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.characters
      WHERE characters.id = character_inventory.character_id
      AND characters.user_id = auth.uid()
    )
  );

-- Insert: Allow if user owns the character
CREATE POLICY "Users can insert into own character inventory" ON public.character_inventory
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.characters
      WHERE characters.id = character_inventory.character_id
      AND characters.user_id = auth.uid()
    )
  );

-- Update: Allow if user owns the character
CREATE POLICY "Users can update own character inventory" ON public.character_inventory
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.characters
      WHERE characters.id = character_inventory.character_id
      AND characters.user_id = auth.uid()
    )
  );

-- Delete: Allow if user owns the character
CREATE POLICY "Users can delete from own character inventory" ON public.character_inventory
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.characters
      WHERE characters.id = character_inventory.character_id
      AND characters.user_id = auth.uid()
    )
  );
