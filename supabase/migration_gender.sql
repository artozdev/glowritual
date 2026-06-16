-- ════════════════════════════════════════════════════════════════
--  RECOMMANDATIONS GENRÉES
--  À exécuter dans Supabase → SQL Editor (idempotent).
-- ════════════════════════════════════════════════════════════════

-- 1) Profil : préférence d'affichage des produits selon le genre.
--    null = dérivée du genre d'onboarding (femme/homme → leur catalogue,
--    autre/non précisé → produits universels). Valeurs : female|male|all|unisex.
alter table public.profiles
  add column if not exists product_gender_pref text;

-- 2) Produits : genre cible (female | male | unisex).
alter table public.products
  add column if not exists target_gender text default 'unisex';

-- Backfill depuis la colonne `gender` existante (all → unisex).
update public.products
set target_gender = case
  when gender = 'female' then 'female'
  when gender = 'male'   then 'male'
  else 'unisex'
end;

-- Produits genrés explicites (exemples) : sérum cils → femme, barbe → homme.
update public.products set gender = 'female', target_gender = 'female'
  where id = 'az-serum-cils-ricin';
update public.products set gender = 'male', target_gender = 'male'
  where id = 'az-huile-barbe';
