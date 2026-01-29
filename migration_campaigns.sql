
-- Create CAMPAIGNS table
create table campaigns (
  id uuid default gen_random_uuid() primary key,
  dm_id uuid references auth.users not null, -- The creator/DM
  title text not null,
  description text,
  join_code text unique, -- Short code like 'A9X-2B1'
  status text default 'active', -- 'active', 'archived', 'paused'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Establish RLS for campaigns
alter table campaigns enable row level security;

-- Policy: DM can do anything to their own campaigns
create policy "Users can insert their own campaigns"
  on campaigns for insert
  with check (auth.uid() = dm_id);

create policy "Users can update their own campaigns"
  on campaigns for update
  using (auth.uid() = dm_id);

create policy "Users can delete their own campaigns"
  on campaigns for delete
  using (auth.uid() = dm_id);

-- Policy: Everyone can read campaigns (or restrict to members/dm only)
-- For 'joining', we might need to query by join_code publicly.
create policy "Campaigns are viewable by everyone"
  on campaigns for select
  using (true); 


-- Create CAMPAIGN_MEMBERS table
create table campaign_members (
  id uuid default gen_random_uuid() primary key,
  campaign_id uuid references campaigns on delete cascade not null,
  user_id uuid references auth.users not null,
  character_id uuid references characters on delete cascade, -- Optional initially? But plan says 'Join with Character'
  role text default 'player', -- 'player', 'spectator'
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Prevent duplicate joining with same character
  unique(campaign_id, character_id) 
);

-- Establish RLS for members
alter table campaign_members enable row level security;

-- Policy: Users can see memberships for campaigns they are in or if they are the DM
create policy "View campaign members"
  on campaign_members for select
  using (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT dm_id FROM campaigns WHERE id = campaign_members.campaign_id)
  );

-- Policy: Users can insert themselves (Join)
create policy "Users can join campaigns"
  on campaign_members for insert
  with check (auth.uid() = user_id);

-- Policy: Users can remove themselves, DM can remove anyone
create policy "Users can leave or DM can kick"
  on campaign_members for delete
  using (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT dm_id FROM campaigns WHERE id = campaign_members.campaign_id)
  );


-- Policy Update for CHARACTERS table (DM Intervention)
-- Allow DM to update characters that are in their campaign
create policy "DMs can update characters in their campaign"
  on characters for update
  using (
    auth.uid() IN (
      SELECT c.dm_id 
      FROM campaigns c
      JOIN campaign_members cm ON cm.campaign_id = c.id
      WHERE cm.character_id = characters.id
    )
  );
