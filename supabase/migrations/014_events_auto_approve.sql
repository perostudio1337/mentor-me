-- ============================================================
-- Mentor.me — Events go live immediately (Phase 4 revision)
-- ============================================================
-- The original flow needed an admin to flip events from 'pending'
-- to 'approved'. We are not building an admin panel for the MVP, so
-- community events should publish straight away. This migration:
--
--   1. Approves any events that were stuck in 'pending'.
--   2. Switches the column default to 'approved'.
--   3. Replaces the old INSERT policy so users can submit events
--      that are already 'approved' (without needing an admin).
--   4. Keeps the existing SELECT/UPDATE policies — creators still own
--      their event and can edit it.
-- ============================================================

-- 1) Backfill existing rows
update public.events
   set status = 'approved',
       updated_at = now()
 where status = 'pending';

-- 2) Default future inserts to approved
alter table public.events
  alter column status set default 'approved';

-- 3) Replace insert policies so we don't require status='pending'
drop policy if exists "Users can create events"           on public.events;
drop policy if exists "Mentors can create events"         on public.events;
drop policy if exists "Any user can submit events"        on public.events;

create policy "Authenticated users can publish events"
  on public.events
  for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = events.creator_id
        and p.user_id = auth.uid()
    )
    and status in ('approved', 'pending')
  );

-- 4) Allow creators to update their event regardless of status
drop policy if exists "Creators can update own pending events" on public.events;
create policy "Creators can update own events"
  on public.events
  for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = events.creator_id
        and p.user_id = auth.uid()
    )
  );

-- 5) Let creators delete their own events
drop policy if exists "Creators can delete own events" on public.events;
create policy "Creators can delete own events"
  on public.events
  for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = events.creator_id
        and p.user_id = auth.uid()
    )
  );
