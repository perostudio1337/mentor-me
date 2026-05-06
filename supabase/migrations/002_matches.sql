-- ============================================================
-- Mentor.me — Matches Table (Phase 2)
-- ============================================================

create table if not exists public.matches (
  id uuid default gen_random_uuid() primary key,
  mentor_id uuid references public.profiles(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  score integer not null check (score >= 0 and score <= 100),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  reasoning text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (mentor_id, student_id)
);

alter table public.matches enable row level security;

-- Read: only participants can view a match
create policy "Match participants can view"
  on public.matches for select
  using (
    exists (
      select 1
      from public.profiles p
      where p.id in (matches.mentor_id, matches.student_id)
        and p.user_id = auth.uid()
    )
  );

-- Insert: participant can create a match row (used for suggestions)
create policy "Match participants can create"
  on public.matches for insert
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id in (matches.mentor_id, matches.student_id)
        and p.user_id = auth.uid()
    )
  );

-- Update: participant can accept/decline
create policy "Match participants can update"
  on public.matches for update
  using (
    exists (
      select 1
      from public.profiles p
      where p.id in (matches.mentor_id, matches.student_id)
        and p.user_id = auth.uid()
    )
  );

-- Auto-update updated_at timestamp
create trigger on_match_updated
  before update on public.matches
  for each row
  execute function public.handle_updated_at();

create index if not exists matches_student_id_idx on public.matches(student_id);
create index if not exists matches_mentor_id_idx on public.matches(mentor_id);
create index if not exists matches_status_idx on public.matches(status);

