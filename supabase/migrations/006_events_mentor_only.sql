-- ============================================================
-- Mentor.me — Events: mentor-only creation
-- ============================================================

drop policy if exists "Users can create events" on public.events;

create policy "Mentors can create events"
  on public.events for insert
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = events.creator_id
        and p.user_id = auth.uid()
        and p.role = 'mentor'
    )
    and status = 'pending'
  );

