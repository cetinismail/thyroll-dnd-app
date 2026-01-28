
-- Create news table
create table public.news (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  version text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.news enable row level security;

-- Policy: Everyone can read active news
create policy "News are viewable by everyone" on public.news for select using (is_active = true);

-- Insert Initial Data
insert into public.news (title, content, version, created_at)
values 
('Sistem Güncellemesi v1.0', 'Thyroll temelleri atıldı. Beta aşamasına hoş geldin.', 'v1.0', now() - interval '2 days'),
('Sistem Güncellemesi v1.1', 'Karakter özellikleri, büyü kütüphanesi ve envanter sistemi tamamlandı. Artık karakterleriniz çok daha detaylı!', 'v1.1', now());
