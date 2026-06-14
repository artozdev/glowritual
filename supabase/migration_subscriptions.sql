-- ════════════════════════════════════════════════════════════════
--  ABONNEMENTS STRIPE — table « subscriptions »
--  À exécuter une fois dans Supabase → SQL Editor (idempotent).
--  Source de vérité du statut Premium. Écrite UNIQUEMENT par le webhook
--  Stripe (service role) ; l'utilisateur ne peut que LIRE sa ligne
--  → impossible de s'auto-octroyer le Premium côté client.
-- ════════════════════════════════════════════════════════════════

create table if not exists public.subscriptions (
  user_id                uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id     text,
  stripe_subscription_id text,
  status                 text,          -- active, trialing, past_due, canceled…
  price_id               text,
  plan_interval          text,          -- 'month' | 'year'
  current_period_end     timestamptz,
  updated_at             timestamptz not null default now()
);

create index if not exists subscriptions_customer_idx
  on public.subscriptions (stripe_customer_id);

alter table public.subscriptions enable row level security;

-- Lecture seule pour le propriétaire. Aucune policy insert/update/delete :
-- seules les écritures via la clé service role (webhook) sont autorisées.
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions
  for select to authenticated using (auth.uid() = user_id);
