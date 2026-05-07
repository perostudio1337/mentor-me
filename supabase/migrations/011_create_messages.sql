-- supabase/migrations/003_create_messages.sql

create table public.messages (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references public.matches(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  read_at timestamp with time zone,
  created_at timestamp with time zone default now() not null
);

-- Row Level Security
alter table public.messages enable row level security;

-- Nur Teilnehmer eines Matches dürfen Nachrichten sehen
create policy "Users can view their own messages"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- Nur eingeloggte User dürfen Nachrichten senden
create policy "Users can insert messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

-- Nur Empfänger darf read_at updaten
create policy "Receiver can update read_at"
  on public.messages for update
  using (auth.uid() = receiver_id);

-- Index für schnelle Abfragen
create index messages_match_id_idx on public.messages(match_id);
create index messages_created_at_idx on public.messages(created_at);