create table if not exists public.screenplays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_id text not null,
  title text not null default 'Untitled screenplay' check (char_length(title) between 1 and 200),
  content jsonb not null default '[]'::jsonb,
  logline text not null default '',
  genre text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint screenplays_user_local_id_unique unique (user_id, local_id)
);
create index if not exists screenplays_user_updated_idx on public.screenplays (user_id, updated_at desc);
alter table public.screenplays enable row level security;
drop policy if exists "Writers can read their own screenplays" on public.screenplays;
create policy "Writers can read their own screenplays" on public.screenplays for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Writers can create their own screenplays" on public.screenplays;
create policy "Writers can create their own screenplays" on public.screenplays for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Writers can update their own screenplays" on public.screenplays;
create policy "Writers can update their own screenplays" on public.screenplays for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Writers can delete their own screenplays" on public.screenplays;
create policy "Writers can delete their own screenplays" on public.screenplays for delete to authenticated using ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.screenplays to authenticated;
