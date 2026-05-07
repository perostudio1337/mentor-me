-- ============================================================
-- Mentor.me — Manual Match Seed (Admin use only)
-- Inserts a pre-accepted match between a known mentor and student.
-- Run in Supabase Dashboard → SQL Editor.
-- ============================================================

-- Mentor profile id:  3fea9e7b-dc2d-4560-9ca8-9ce679d01d4c
-- Student profile id: 0ceeeb08-2a6e-4789-be96-4a8f009b2aaf

insert into public.matches (mentor_id, student_id, score, status, reasoning)
values (
  '3fea9e7b-dc2d-4560-9ca8-9ce679d01d4c',
  '0ceeeb08-2a6e-4789-be96-4a8f009b2aaf',
  90,
  'accepted',
  'Manually matched by admin — mentor and student were connected directly during the EUDRES Business Booster Week.'
)
on conflict (mentor_id, student_id) do update
  set status    = 'accepted',
      score     = excluded.score,
      reasoning = excluded.reasoning,
      updated_at = now();
