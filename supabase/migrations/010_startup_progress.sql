-- ============================================================
-- Mentor.me — Startup Progress Tracker (Phase 5)
-- ============================================================

create table if not exists public.startup_milestones (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  title text not null check (char_length(title) > 0),
  description text,
  stage text not null check (stage in (
    'idea', 'validated', 'first_customer', 'funding', 'scaling', 'other'
  )),
  achieved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.startup_goals (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  title text not null check (char_length(title) > 0),
  description text,
  due_date timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table public.startup_milestones enable row level security;
alter table public.startup_goals enable row level security;

-- Anyone can view milestones (mentors need to see mentee progress)
create policy "Milestones are viewable by authenticated users"
  on public.startup_milestones for select
  using (auth.role() = 'authenticated');

-- Only owner can insert/update/delete milestones
create policy "Owner can manage milestones"
  on public.startup_milestones for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = startup_milestones.profile_id
        and p.user_id = auth.uid()
    )
  );

-- Anyone can view goals
create policy "Goals are viewable by authenticated users"
  on public.startup_goals for select
  using (auth.role() = 'authenticated');

-- Only owner can manage goals
create policy "Owner can manage goals"
  on public.startup_goals for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = startup_goals.profile_id
        and p.user_id = auth.uid()
    )
  );

-- Indexes
create index if not exists milestones_profile_id_idx
  on public.startup_milestones(profile_id);

create index if not exists goals_profile_id_idx
  on public.startup_goals(profile_id);
