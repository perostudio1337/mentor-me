-- ============================================================
-- Mentor.me — Events + RSVPs (Phase 4: Event Discovery)
-- Run this in Supabase Dashboard → SQL Editor
--
-- This is a COMBINED migration — replaces 005, 006, and the
-- original 007. Run this single file. No prerequisites needed
-- beyond 001_profiles.sql (profiles table must exist).
-- ============================================================

-- 1) Create events table (full schema with category, link, end_date)
create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid references public.profiles(id) on delete cascade not null,
  title text not null check (char_length(title) between 3 and 120),
  description text not null check (char_length(description) between 10 and 2000),
  category text not null default 'other'
    check (category in (
      'pitch-night', 'workshop', 'hackathon', 'networking',
      'bootcamp', 'meetup', 'conference', 'lecture',
      'career-fair', 'webinar', 'office-hours', 'other'
    )),
  date timestamptz not null,
  end_date timestamptz,
  location text not null default '' check (char_length(location) <= 140),
  link text not null default '' check (char_length(link) <= 500),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.events enable row level security;

-- Public can read approved events
create policy "Approved events are publicly readable"
  on public.events for select
  using (status = 'approved');

-- Creator can read their own events (incl. pending/rejected)
create policy "Creators can read own events"
  on public.events for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = events.creator_id
        and p.user_id = auth.uid()
    )
  );

-- Any authenticated user can submit an event (always starts as pending)
create policy "Any user can submit events"
  on public.events for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = events.creator_id
        and p.user_id = auth.uid()
    )
    and status = 'pending'
  );

-- Creator can update draft fields while pending (not status)
create policy "Creators can update own pending events"
  on public.events for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = events.creator_id
        and p.user_id = auth.uid()
    )
    and status = 'pending'
  );

-- Admin can approve/reject and edit anything
create policy "Admins can moderate events"
  on public.events for update
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Auto-update updated_at (reuses handle_updated_at from 001_profiles)
create trigger on_event_updated
  before update on public.events
  for each row
  execute function public.handle_updated_at();

create index if not exists events_status_date_idx on public.events(status, date);
create index if not exists events_creator_id_idx on public.events(creator_id);
create index if not exists events_category_idx on public.events(category);


-- 2) Create event_rsvps table
create table if not exists public.event_rsvps (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique(event_id, user_id)
);

alter table public.event_rsvps enable row level security;

-- Anyone can see RSVPs
create policy "RSVPs are publicly readable"
  on public.event_rsvps for select
  using (true);

-- Authenticated users can RSVP
create policy "Users can RSVP to events"
  on public.event_rsvps for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = event_rsvps.user_id
        and p.user_id = auth.uid()
    )
  );

-- Users can remove their own RSVP
create policy "Users can remove own RSVP"
  on public.event_rsvps for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = event_rsvps.user_id
        and p.user_id = auth.uid()
    )
  );

create index if not exists event_rsvps_event_id_idx on public.event_rsvps(event_id);
create index if not exists event_rsvps_user_id_idx on public.event_rsvps(user_id);
