-- ============================================================
-- Mentor.me — Milestone Feed (Phase 6)
-- ============================================================
-- Adds:
--   • milestone_posts        — feed posts (text + optional image + optional
--                              attached challenge)
--   • post_likes             — one-row-per-user-per-post likes
--   • post_comments          — threaded comments under a post
--   • Storage bucket         — "post-images" (public read, owner write)
--
-- Posts can be created from anywhere, but the most common path is from the
-- "Challenge Completed" modal in /dashboard/challenges. When a post is
-- linked to a `challenge_enrollments` row, the completed challenge becomes
-- part of the user's journal/journey timeline.
-- ============================================================

create extension if not exists "pgcrypto";

-- ── milestone_posts ─────────────────────────────────────────────
create table if not exists public.milestone_posts (
  id                       uuid primary key default gen_random_uuid(),
  author_id                uuid not null references public.profiles(id) on delete cascade,

  -- Content
  content                  text not null check (char_length(content) between 1 and 2000),
  image_url                text,

  -- Optional link to a completed challenge → drives journal entries
  challenge_enrollment_id  uuid references public.challenge_enrollments(id) on delete set null,
  challenge_id             uuid references public.challenges(id) on delete set null,

  -- Categorisation
  kind                     text not null default 'milestone'
                           check (kind in ('milestone','challenge_complete','event','update')),

  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index if not exists milestone_posts_author_idx
  on public.milestone_posts (author_id, created_at desc);

create index if not exists milestone_posts_feed_idx
  on public.milestone_posts (created_at desc);

create index if not exists milestone_posts_challenge_idx
  on public.milestone_posts (challenge_id);

-- ── post_likes ──────────────────────────────────────────────────
create table if not exists public.post_likes (
  post_id     uuid not null references public.milestone_posts(id) on delete cascade,
  profile_id  uuid not null references public.profiles(id)        on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (post_id, profile_id)
);

create index if not exists post_likes_profile_idx
  on public.post_likes (profile_id);

-- ── post_comments ───────────────────────────────────────────────
create table if not exists public.post_comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.milestone_posts(id) on delete cascade,
  author_id   uuid not null references public.profiles(id)        on delete cascade,
  content     text not null check (char_length(content) between 1 and 1000),
  created_at  timestamptz not null default now()
);

create index if not exists post_comments_post_idx
  on public.post_comments (post_id, created_at);

-- ── RLS ─────────────────────────────────────────────────────────
alter table public.milestone_posts enable row level security;
alter table public.post_likes      enable row level security;
alter table public.post_comments   enable row level security;

-- Posts are visible to any signed-in user
drop policy if exists "Posts viewable by authenticated users"
  on public.milestone_posts;
create policy "Posts viewable by authenticated users"
  on public.milestone_posts
  for select
  using (auth.role() = 'authenticated');

-- Only the author can insert / update / delete their own post
drop policy if exists "Authors manage their posts" on public.milestone_posts;
create policy "Authors manage their posts"
  on public.milestone_posts
  for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = milestone_posts.author_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = milestone_posts.author_id
        and p.user_id = auth.uid()
    )
  );

-- Likes — anyone signed-in can read; users manage their own
drop policy if exists "Likes viewable by authenticated users" on public.post_likes;
create policy "Likes viewable by authenticated users"
  on public.post_likes
  for select
  using (auth.role() = 'authenticated');

drop policy if exists "Users manage their likes" on public.post_likes;
create policy "Users manage their likes"
  on public.post_likes
  for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = post_likes.profile_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = post_likes.profile_id
        and p.user_id = auth.uid()
    )
  );

-- Comments — anyone signed-in reads; only author mutates
drop policy if exists "Comments viewable by authenticated users" on public.post_comments;
create policy "Comments viewable by authenticated users"
  on public.post_comments
  for select
  using (auth.role() = 'authenticated');

drop policy if exists "Authors manage their comments" on public.post_comments;
create policy "Authors manage their comments"
  on public.post_comments
  for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = post_comments.author_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = post_comments.author_id
        and p.user_id = auth.uid()
    )
  );

-- ── updated_at trigger for posts ────────────────────────────────
create or replace function public.set_updated_at_milestone_posts()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_milestone_posts_updated_at on public.milestone_posts;
create trigger trg_milestone_posts_updated_at
  before update on public.milestone_posts
  for each row
  execute function public.set_updated_at_milestone_posts();

-- ── Storage bucket for post images ─────────────────────────────
-- Creates a PUBLIC bucket called "post-images". Anyone authenticated
-- can upload into a folder named after their auth.uid(); the file is
-- publicly readable (so it can be embedded in the feed).
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

drop policy if exists "Anyone can read post images" on storage.objects;
create policy "Anyone can read post images"
  on storage.objects
  for select
  using (bucket_id = 'post-images');

drop policy if exists "Users upload to their own folder" on storage.objects;
create policy "Users upload to their own folder"
  on storage.objects
  for insert
  with check (
    bucket_id = 'post-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users update/delete own post images" on storage.objects;
create policy "Users update/delete own post images"
  on storage.objects
  for all
  using (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
