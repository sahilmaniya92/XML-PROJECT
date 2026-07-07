-- TaskScape Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Pages with nesting support
create table if not exists public.pages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  parent_id uuid references public.pages(id) on delete cascade,
  title text default 'Untitled' not null,
  icon text default '📄',
  cover text default 'ocean',
  content text default '',
  favorite boolean default false,
  sort_order int default 0,
  is_deleted boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists pages_user_id_idx on public.pages(user_id);
create index if not exists pages_parent_id_idx on public.pages(parent_id);

-- Calendar events
create table if not exists public.calendar_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null default 'Untitled event',
  event_date date not null,
  color text default '#7c3aed',
  created_at timestamptz default now()
);

create index if not exists calendar_events_user_id_idx on public.calendar_events(user_id);

-- Auto-update updated_at on pages
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists pages_updated_at on public.pages;
create trigger pages_updated_at
  before update on public.pages
  for each row execute function public.handle_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.pages enable row level security;
alter table public.calendar_events enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Pages policies
create policy "Users can view own pages"
  on public.pages for select using (auth.uid() = user_id);
create policy "Users can insert own pages"
  on public.pages for insert with check (auth.uid() = user_id);
create policy "Users can update own pages"
  on public.pages for update using (auth.uid() = user_id);
create policy "Users can delete own pages"
  on public.pages for delete using (auth.uid() = user_id);

-- Calendar policies
create policy "Users can view own events"
  on public.calendar_events for select using (auth.uid() = user_id);
create policy "Users can insert own events"
  on public.calendar_events for insert with check (auth.uid() = user_id);
create policy "Users can update own events"
  on public.calendar_events for update using (auth.uid() = user_id);
create policy "Users can delete own events"
  on public.calendar_events for delete using (auth.uid() = user_id);

-- Enable realtime for multi-user sync
alter publication supabase_realtime add table public.pages;
alter publication supabase_realtime add table public.calendar_events;
