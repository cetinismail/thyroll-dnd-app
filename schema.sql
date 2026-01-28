-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: profiles (Extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  avatar_url text,
  updated_at timestamp with time zone,
  
  constraint username_length check (char_length(username) >= 3)
);

-- Table: classes (D&D Classes e.g. Wizard, Fighter)
create table public.classes (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  description text,
  hit_die text not null, -- e.g. "d8", "d10"
  primary_ability text not null, -- e.g. "Strength", "Intelligence"
  saves text[], -- Array of saving throws e.g. ["Constitution", "Intelligence"]
  starting_equipment jsonb
);

-- Table: races (D&D Races e.g. Human, Elf)
create table public.races (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  description text,
  speed integer default 30,
  size text default 'Medium',
  traits jsonb -- JSON specifically for racial traits
);

-- Table: characters
create table public.characters (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  name text not null,
  level integer default 1 check (level >= 1 and level <= 20),
  class_id uuid references public.classes(id),
  race_id uuid references public.races(id),
  
  -- Core Stats
  strength integer default 10,
  dexterity integer default 10,
  constitution integer default 10,
  intelligence integer default 10,
  wisdom integer default 10,
  charisma integer default 10,
  
  current_hp integer default 10,
  current_hp integer default 10,
  max_hp integer default 10,
  armor_class integer default 10,
  background text,
  appearance text,
  image_url text, -- URL to character portrait
  currency jsonb default '{"gp": 0, "sp": 0, "cp": 0}',
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.characters enable row level security;
alter table public.classes enable row level security;
alter table public.races enable row level security;

-- Policies
-- Profiles: Everyone can see usernames, only owner can update
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Characters: Users can only see and edit their own characters
create policy "Users can view own characters" on public.characters for select using (auth.uid() = user_id);
create policy "Users can insert own characters" on public.characters for insert with check (auth.uid() = user_id);
create policy "Users can update own characters" on public.characters for update using (auth.uid() = user_id);
create policy "Users can delete own characters" on public.characters for delete using (auth.uid() = user_id);

-- Classes/Races: Public read-only
create policy "Classes are viewable by everyone" on public.classes for select using (true);
create policy "Races are viewable by everyone" on public.races for select using (true);

-- Auto-create profile on signup trigger
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Table: features (All class/race features)
create table public.features (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null,
  source_type text not null check (source_type in ('Race', 'Class', 'Background')),
  source_id uuid, -- Can link to classes.id or races.id if needed, or kept loose
  level_required integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: spells (All spells)
create table public.spells (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null,
  level integer not null, -- 0 for Cantrip
  school text,
  casting_time text,
  range text,
  components text,
  duration text,
  translation jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: class_spells (Linking classes to spells)
create table public.class_spells (
  class_id uuid references public.classes(id) on delete cascade not null,
  spell_id uuid references public.spells(id) on delete cascade not null,
  primary key (class_id, spell_id)
);

-- Table: class_features (Linking classes to features)
create table public.class_features (
  class_id uuid references public.classes(id) on delete cascade not null,
  feature_id uuid references public.features(id) on delete cascade not null,
  level_custom integer, -- If a class gets it at a different level than default
  primary key (class_id, feature_id)
);

-- RLS Policies
alter table public.features enable row level security;
create policy "Features are viewable by everyone" on public.features for select using (true);

alter table public.spells enable row level security;
create policy "Spells are viewable by everyone" on public.spells for select using (true);

-- Table: monsters
create table public.monsters (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
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
  translation jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: items
create table public.items (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  equipment_category text,
  rarity text default 'Common',
  cost_desc text,
  weight numeric,
  description text,
  properties_json jsonb,
  image_url text,
  translation jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add translation to spells if not executing full create
-- (This part simulates the alter commands in schema doc if we wanted to be precise, 
-- but usually schema.sql represents final state. Let's update spells table definition too)

-- RLS for new tables
alter table public.monsters enable row level security;
alter table public.items enable row level security;

create policy "Items are viewable by everyone" on public.items for select using (true);


-- Table: character_inventory
create table public.character_inventory (
  id uuid default uuid_generate_v4() primary key,
  character_id uuid references public.characters(id) on delete cascade not null,
  item_id uuid references public.items(id) on delete cascade not null,
  quantity integer default 1 check (quantity > 0),
  is_equipped boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for character_inventory
alter table public.character_inventory enable row level security;

create policy "Users can view own character inventory" on public.character_inventory
  for select using (
    exists (
      select 1 from public.characters
      where characters.id = character_inventory.character_id
      and characters.user_id = auth.uid()
    )
  );

create policy "Users can insert into own character inventory" on public.character_inventory
  for insert with check (
    exists (
      select 1 from public.characters
      where characters.id = character_inventory.character_id
      and characters.user_id = auth.uid()
    )
  );

create policy "Users can update own character inventory" on public.character_inventory
  for update using (
    exists (
      select 1 from public.characters
      where characters.id = character_inventory.character_id
      and characters.user_id = auth.uid()
    )
  );

create policy "Users can delete from own character inventory" on public.character_inventory
  for delete using (
    exists (
      select 1 from public.characters
      where characters.id = character_inventory.character_id
      and characters.user_id = auth.uid()
    )
  );


