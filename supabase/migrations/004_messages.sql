-- ============================================================
-- Mentor.me — Messages Table (Phase 3)
-- ============================================================

create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references public.matches(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null check (char_length(content) > 0),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

-- Only match participants can read messages
create policy "Message participants can view"
  on public.messages for select
  using (
    exists (
      select 1
      from public.matches m
      join public.profiles p on p.user_id = auth.uid()
      where m.id = messages.match_id
        and p.id in (m.mentor_id, m.student_id)
    )
  );

-- Only sender can insert, and must be a match participant
create policy "Message participants can send"
  on public.messages for insert
  with check (
    exists (
      select 1
      from public.matches m
      join public.profiles p on p.user_id = auth.uid()
      where m.id = messages.match_id
        and p.id = messages.sender_id
        and messages.receiver_id in (m.mentor_id, m.student_id)
        and p.id in (m.mentor_id, m.student_id)
        and messages.receiver_id != messages.sender_id
    )
  );

-- Only receiver can update read_at, and must be a match participant
create policy "Receiver can mark read"
  on public.messages for update
  using (
    exists (
      select 1
      from public.matches m
      join public.profiles p on p.user_id = auth.uid()
      where m.id = messages.match_id
        and p.id = messages.receiver_id
        and p.id in (m.mentor_id, m.student_id)
        
    )
  );

create index if not exists messages_match_id_created_at_idx
  on public.messages(match_id, created_at);

create index if not exists messages_receiver_id_read_at_idx
  on public.messages(receiver_id, read_at);

