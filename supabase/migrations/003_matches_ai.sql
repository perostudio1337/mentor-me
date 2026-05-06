-- ============================================================
-- Mentor.me — Matches AI fields (Phase 2 AI)
-- ============================================================

alter table public.matches
  add column if not exists ai_score integer,
  add column if not exists ai_reasoning text not null default '',
  add column if not exists algorithm_version text not null default 'heuristic-v1';

alter table public.matches
  add constraint matches_ai_score_range
  check (ai_score is null or (ai_score >= 0 and ai_score <= 100));

create index if not exists matches_algorithm_version_idx on public.matches(algorithm_version);

