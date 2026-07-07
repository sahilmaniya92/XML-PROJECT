-- TaskScape Supabase schema
-- Run this in Supabase Dashboard → SQL Editor after creating your project.

create table if not exists public.pages (
  id text primary key,
  user_id uuid references auth.users (id) on delete cascade not null,
  title text not null default 'Untitled',
  icon text default '📄',
  cover text default 'ocean',
  content text default '',
  favorite boolean default false,
  trashed boolean default false,
  updated_at timestamptz default now()
);

create table if not exists public.calendar_events (
  id text primary key,
  user_id uuid references auth.users (id) on delete cascade not null,
  title text not null,
  date text not null,
  color text default '#7c3aed'
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  active_page_id text,
  sidebar_open boolean default true,
  active_view text default 'home',
  codefusion_messages jsonb,
  updated_at timestamptz default now()
);

create index if not exists pages_user_id_idx on public.pages (user_id);
create index if not exists calendar_events_user_id_idx on public.calendar_events (user_id);

alter table public.pages enable row level security;
alter table public.calendar_events enable row level security;
alter table public.user_settings enable row level security;

create policy "Users manage own pages"
  on public.pages
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own calendar events"
  on public.calendar_events
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own settings"
  on public.user_settings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
