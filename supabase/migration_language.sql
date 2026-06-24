-- Préférence de langue de l'interface (fr/en). À exécuter dans Supabase → SQL Editor.
alter table public.profiles add column if not exists language text;
