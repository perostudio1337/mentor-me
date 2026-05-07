-- ============================================================
-- Mentor.me — Manual Match Seed: joppe ↔ roooooo
-- Inserts or updates a manual match between two profiles (admin use)
-- Run in Supabase Dashboard → SQL Editor or apply via migration tooling.
-- ============================================================

-- Profile ids:
-- joppe: f3f4fc52-ddd9-42d3-9216-7de72ed62fe4
-- roooooo: 3fea9e7b-dc2d-4560-9ca8-9ce679d01d4c

insert into public.matches (mentor_id, student_id, score, status, reasoning)
values (
  'f3f4fc52-ddd9-42d3-9216-7de72ed62fe4',
  '3fea9e7b-dc2d-4560-9ca8-9ce679d01d4c',
  85,
  'accepted',
  'Manually matched by admin per request — connected manually for testing.'
)
on conflict (mentor_id, student_id) do update
  set status    = excluded.status,
      score     = excluded.score,
      reasoning = excluded.reasoning,
      updated_at = now();
