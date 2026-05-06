-- ============================================================
-- Mentor.me — Events Table (Phase 4)
-- Admin verification workflow: pending -> approved/rejected
--
-- Admin policy uses auth JWT claim:
--   (auth.jwt()->'app_metadata'->>'role') = 'admin'
-- Set this in Supabase Auth for admin users.
-- ============================================================

create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid references public.profiles(id) on delete cascade not null,
  title text not null check (char_length(title) between 3 and 120),
  description text not null check (char_length(description) between 10 and 2000),
  date timestamptz not null,
  location text not null default '' check (char_length(location) <= 140),
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

-- Any authenticated user can create an event for themselves (always pending)
create policy "Users can create events"
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

create trigger on_event_updated
  before update on public.events
  for each row
  execute function public.handle_updated_at();

create index if not exists events_status_date_idx on public.events(status, date);
create index if not exists events_creator_id_idx on public.events(creator_id);

