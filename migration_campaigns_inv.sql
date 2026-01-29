
-- Allow DMs to INSERT into inventory (Give Item)
create policy "DMs can insert inventory items"
  on character_inventory for insert
  with check (
    auth.uid() IN (
      SELECT c.dm_id 
      FROM campaigns c
      JOIN campaign_members cm ON cm.campaign_id = c.id
      WHERE cm.character_id = character_inventory.character_id
    )
  );
