
-- Allow DMs to VIEW characters that are in their campaign
create policy "DMs can view characters in their campaign"
  on characters for select
  using (
    auth.uid() IN (
      SELECT c.dm_id 
      FROM campaigns c
      JOIN campaign_members cm ON cm.campaign_id = c.id
      WHERE cm.character_id = characters.id
    )
  );
