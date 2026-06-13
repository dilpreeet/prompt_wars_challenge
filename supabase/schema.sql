-- Mental Wellness Tracker - database schema + Row Level Security
--
-- How to apply:
--   Supabase Dashboard -> SQL Editor -> paste this file -> Run.
--   (or `supabase db push` if using the Supabase CLI with this as a migration)
--
-- Security model: every table is owned per-user via `user_id` and protected by
-- Row Level Security so a user can only ever read/write their own rows.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.journal_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  content     text not null,
  mood_score  int check (mood_score between 1 and 10),
  ai_analysis jsonb,
  created_at  timestamptz not null default now()
);

create table if not exists public.mood_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  mood       text not null,
  energy     int check (energy between 1 and 5),
  stress     int check (stress between 1 and 5),
  note       text,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       text not null check (role in ('user', 'assistant')),
  content    text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes (per-user, newest-first reads are the common access pattern)
-- ---------------------------------------------------------------------------

create index if not exists journal_entries_user_created_idx
  on public.journal_entries (user_id, created_at desc);

create index if not exists mood_logs_user_created_idx
  on public.mood_logs (user_id, created_at desc);

create index if not exists chat_messages_user_created_idx
  on public.chat_messages (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.journal_entries enable row level security;
alter table public.mood_logs       enable row level security;
alter table public.chat_messages   enable row level security;

-- `for all` + using/with check covers SELECT, INSERT, UPDATE and DELETE so a
-- user can only ever touch rows where auth.uid() matches their user_id.

drop policy if exists "own journal entries" on public.journal_entries;
create policy "own journal entries" on public.journal_entries
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "own mood logs" on public.mood_logs;
create policy "own mood logs" on public.mood_logs
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "own chat messages" on public.chat_messages;
create policy "own chat messages" on public.chat_messages
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Auth notes:
--   Magic link: set Site URL + redirect to /auth/confirm (see README).
--   Guest mode: enable Anonymous Sign-Ins under Authentication → Providers.
-- ---------------------------------------------------------------------------
