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
  saves text[] -- Array of saving throws e.g. ["Constitution", "Intelligence"]
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
