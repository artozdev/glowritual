-- ════════════════════════════════════════════════════════════════
--  MIGRATION « TOUT CLOUD » — scans enrichis + complétions de routine
--  À exécuter une fois dans Supabase → SQL Editor (idempotent).
-- ════════════════════════════════════════════════════════════════

-- 1) Scans : payload complet (analyse, zones, conditions, seed) en JSONB,
--    + marqueur démo. La photo globale reste dans le bucket « scans ».
alter table public.scans
  add column if not exists is_demo boolean not null default false,
  add column if not exists data    jsonb;

-- 2) Complétions de routine (suivi des tâches cochées, par utilisateur).
create table if not exists public.routine_completions (
  user_id      uuid not null references auth.users (id) on delete cascade,
  task_id      text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, task_id)
);

alter table public.routine_completions enable row level security;

drop policy if exists "rc_select_own" on public.routine_completions;
create policy "rc_select_own" on public.routine_completions
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "rc_insert_own" on public.routine_completions;
create policy "rc_insert_own" on public.routine_completions
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "rc_delete_own" on public.routine_completions;
create policy "rc_delete_own" on public.routine_completions
  for delete to authenticated using (auth.uid() = user_id);
