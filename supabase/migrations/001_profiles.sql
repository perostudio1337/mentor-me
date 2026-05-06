-- ============================================================
-- Mentor.me — Profiles Table
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- Create profiles table
create table public.profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  role text not null check (role in ('mentor', 'student')),
  name text not null default '',
  email text not null default '',
  avatar_url text,
  bio text not null default '',
  expertise text[] not null default '{}',
  problem text not null default '',
  idea text not null default '',
  availability text not null default 'flexible',
  is_visible boolean not null default true,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Policy: Anyone can read visible profiles
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (is_visible = true);

-- Policy: Users can read their own profile (even if hidden)
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own profile
create policy "Users can create own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

-- Auto-update the updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profile_updated
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- Auto-create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, email, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Index for faster lookups
create index profiles_user_id_idx on public.profiles(user_id);
create index profiles_role_idx on public.profiles(role);
