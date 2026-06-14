-- ════════════════════════════════════════════════════════════════
-- Glow — Schéma de base de données Supabase
-- À exécuter dans : Supabase Dashboard → SQL Editor → New query.
--
-- Contenu :
--   • Tables : profiles, scans, scan_points, routines, routine_tasks
--   • RLS activé partout → chaque utilisateur n'accède qu'à SES données
--   • Bucket de stockage privé « scans » (chiffré au repos par Supabase)
--   • Trigger : création automatique du profil à l'inscription
-- ════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────
-- 1. TABLES
-- ────────────────────────────────────────────────────────────────

-- Profil applicatif, lié 1-1 à auth.users
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  plan        text not null default 'free' check (plan in ('free', 'premium')),
  scan_count  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- Un scan = une capture (visage ou corps) avec son score global
create table if not exists public.scans (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  kind           text not null default 'face' check (kind in ('face', 'body')),
  image_path     text,                 -- chemin dans le bucket storage « scans »
  overall_score  integer check (overall_score between 0 and 100),
  created_at     timestamptz not null default now()
);

-- Un point d'analyse positionné sur le visage/corps (coords normalisées 0..1)
create table if not exists public.scan_points (
  id              uuid primary key default gen_random_uuid(),
  scan_id         uuid not null references public.scans (id) on delete cascade,
  criterion       text not null,        -- ex. 'hydration', 'glow', 'symmetry'…
  score           integer not null check (score between 0 and 100),
  x               real not null,        -- position horizontale normalisée (0..1)
  y               real not null,        -- position verticale normalisée (0..1)
  explanation     text,
  recommendation  text
);

-- Une routine générée à partir d'un scan
create table if not exists public.routines (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  scan_id     uuid references public.scans (id) on delete set null,
  created_at  timestamptz not null default now()
);

-- Tâche planifiée d'une routine (matin / soir / hebdo)
-- user_id dupliqué ici pour simplifier les policies RLS.
create table if not exists public.routine_tasks (
  id              uuid primary key default gen_random_uuid(),
  routine_id      uuid not null references public.routines (id) on delete cascade,
  user_id         uuid not null references auth.users (id) on delete cascade,
  title           text not null,
  detail          text,
  period          text not null check (period in ('morning', 'evening', 'weekly')),
  scheduled_date  date,
  completed       boolean not null default false,
  completed_at    timestamptz
);

-- Index utiles
create index if not exists scans_user_created_idx
  on public.scans (user_id, created_at desc);
create index if not exists scan_points_scan_idx
  on public.scan_points (scan_id);
create index if not exists routine_tasks_routine_idx
  on public.routine_tasks (routine_id);
create index if not exists routine_tasks_date_idx
  on public.routine_tasks (user_id, scheduled_date);

-- ────────────────────────────────────────────────────────────────
-- 2. RLS (Row Level Security)
-- ────────────────────────────────────────────────────────────────

alter table public.profiles      enable row level security;
alter table public.scans         enable row level security;
alter table public.scan_points   enable row level security;
alter table public.routines      enable row level security;
alter table public.routine_tasks enable row level security;

-- profiles : un user ne voit/modifie que sa propre ligne
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- scans
create policy "scans_select_own" on public.scans
  for select using (auth.uid() = user_id);
create policy "scans_insert_own" on public.scans
  for insert with check (auth.uid() = user_id);
create policy "scans_update_own" on public.scans
  for update using (auth.uid() = user_id);
create policy "scans_delete_own" on public.scans
  for delete using (auth.uid() = user_id);

-- scan_points : accès via le scan parent appartenant au user
create policy "scan_points_select_own" on public.scan_points
  for select using (
    exists (select 1 from public.scans s
            where s.id = scan_points.scan_id and s.user_id = auth.uid())
  );
create policy "scan_points_insert_own" on public.scan_points
  for insert with check (
    exists (select 1 from public.scans s
            where s.id = scan_points.scan_id and s.user_id = auth.uid())
  );
create policy "scan_points_delete_own" on public.scan_points
  for delete using (
    exists (select 1 from public.scans s
            where s.id = scan_points.scan_id and s.user_id = auth.uid())
  );

-- routines
create policy "routines_select_own" on public.routines
  for select using (auth.uid() = user_id);
create policy "routines_insert_own" on public.routines
  for insert with check (auth.uid() = user_id);
create policy "routines_update_own" on public.routines
  for update using (auth.uid() = user_id);
create policy "routines_delete_own" on public.routines
  for delete using (auth.uid() = user_id);

-- routine_tasks
create policy "routine_tasks_select_own" on public.routine_tasks
  for select using (auth.uid() = user_id);
create policy "routine_tasks_insert_own" on public.routine_tasks
  for insert with check (auth.uid() = user_id);
create policy "routine_tasks_update_own" on public.routine_tasks
  for update using (auth.uid() = user_id);
create policy "routine_tasks_delete_own" on public.routine_tasks
  for delete using (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────
-- 3. TRIGGER — création automatique du profil à l'inscription
-- ────────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ────────────────────────────────────────────────────────────────
-- 4. STORAGE — bucket privé « scans »
--    Les fichiers sont rangés par dossier = user_id : « <uid>/<scan>.jpg »
-- ────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('scans', 'scans', false)
on conflict (id) do nothing;

create policy "scans_storage_select_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'scans' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "scans_storage_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'scans' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "scans_storage_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'scans' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "scans_storage_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'scans' and (storage.foldername(name))[1] = auth.uid()::text);

-- ────────────────────────────────────────────────────────────────
-- 5. PROFIL BEAUTÉ — colonnes pour personnaliser les recommandations
-- ────────────────────────────────────────────────────────────────

alter table public.profiles
  add column if not exists onboarding_completed boolean not null default false,
  add column if not exists display_name   text,
  add column if not exists age_band        text,
  add column if not exists gender          text,
  add column if not exists skin_type       text default 'unknown',
  add column if not exists concerns        text[] not null default '{}',
  add column if not exists goal            text,
  add column if not exists sleep           text,
  add column if not exists hydration       text,
  add column if not exists activity        text,
  add column if not exists stress          text,
  add column if not exists diet            text default 'omnivore',
  add column if not exists allergies       text[] not null default '{}',
  add column if not exists current_routine text,
  add column if not exists routine_time    text default '15min',
  add column if not exists product_pref    text default 'whatever',
  add column if not exists budget          text default 'mid';

-- Table dédiée aux réponses d'onboarding (snapshot brut + horodatage).
create table if not exists public.onboarding_answers (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  answers     jsonb not null default '{}',
  completed_at timestamptz not null default now()
);

alter table public.onboarding_answers enable row level security;

create policy "onboarding_select_own" on public.onboarding_answers
  for select using (auth.uid() = user_id);
create policy "onboarding_insert_own" on public.onboarding_answers
  for insert with check (auth.uid() = user_id);
create policy "onboarding_update_own" on public.onboarding_answers
  for update using (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────
-- 6. CATALOGUE PRODUITS — source « provider Supabase » (cf. productProvider.ts)
--    Lecture publique (catalogue) ; écriture réservée au service_role.
-- ────────────────────────────────────────────────────────────────

create table if not exists public.products (
  id              text primary key,
  name            text not null,
  brand           text not null,
  category        text not null,
  need            text not null,        -- besoin principal ciblé
  also_helps      text[] not null default '{}',
  price           numeric not null,
  rating          numeric not null check (rating between 0 and 5),
  review_count    integer not null default 0,
  labels          text[] not null default '{}',
  image_url       text,
  link            text,
  ingredients     text[] not null default '{}',
  key_ingredients jsonb not null default '[]',
  application     text,
  skin_types      text[] not null default '{}',
  gender          text default 'all',
  vegan           boolean default false,
  barcode         text,
  created_at      timestamptz not null default now()
);

create index if not exists products_need_idx on public.products (need);

alter table public.products enable row level security;

-- Catalogue lisible par tous les utilisateurs connectés (aucune donnée perso).
create policy "products_select_all" on public.products
  for select to authenticated using (true);

-- ════════════════════════════════════════════════════════════════
-- 7. MONÉTISATION — affiliation produits & programme ambassadeur
-- ════════════════════════════════════════════════════════════════

-- Colonnes d'affiliation sur le catalogue produits.
alter table public.products
  add column if not exists affiliate_url     text,
  add column if not exists affiliate_network text default 'direct';

-- Clics affiliés (mesure de performance).
create table if not exists public.affiliate_clicks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  product_id  text not null,
  network     text not null,
  created_at  timestamptz not null default now()
);
create index if not exists affiliate_clicks_user_idx
  on public.affiliate_clicks (user_id, created_at desc);

alter table public.affiliate_clicks enable row level security;
create policy "affiliate_clicks_insert_own" on public.affiliate_clicks
  for insert to authenticated with check (auth.uid() = user_id);
create policy "affiliate_clicks_select_own" on public.affiliate_clicks
  for select to authenticated using (auth.uid() = user_id);

-- Codes promo des ambassadeurs (-15 %).
create table if not exists public.promo_codes (
  code             text primary key,
  ambassador_id    uuid not null references auth.users (id) on delete cascade,
  ambassador_name  text not null,
  percent          integer not null default 15,
  created_at       timestamptz not null default now()
);
-- Un ambassadeur = un seul code.
create unique index if not exists promo_codes_ambassador_idx
  on public.promo_codes (ambassador_id);

alter table public.promo_codes enable row level security;
-- Lecture publique (pour valider un code au checkout).
create policy "promo_codes_select_all" on public.promo_codes
  for select to authenticated using (true);
-- L'ambassadeur ne gère que son propre code.
create policy "promo_codes_insert_own" on public.promo_codes
  for insert to authenticated with check (auth.uid() = ambassador_id);

-- Utilisations de codes (attribution + usage unique par personne).
create table if not exists public.promo_redemptions (
  id             uuid primary key default gen_random_uuid(),
  code           text not null references public.promo_codes (code) on delete cascade,
  user_id        uuid not null references auth.users (id) on delete cascade,
  ambassador_id  uuid not null references auth.users (id) on delete cascade,
  created_at     timestamptz not null default now()
);
-- ⛔ Un utilisateur ne peut utiliser QU'UN SEUL code, UNE SEULE fois.
create unique index if not exists promo_redemptions_user_idx
  on public.promo_redemptions (user_id);
create index if not exists promo_redemptions_ambassador_idx
  on public.promo_redemptions (ambassador_id);

alter table public.promo_redemptions enable row level security;
-- L'utilisateur enregistre sa propre utilisation ; l'ambassadeur voit les siennes.
create policy "promo_redemptions_insert_own" on public.promo_redemptions
  for insert to authenticated with check (auth.uid() = user_id);
create policy "promo_redemptions_select_related" on public.promo_redemptions
  for select to authenticated
  using (auth.uid() = user_id or auth.uid() = ambassador_id);

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
