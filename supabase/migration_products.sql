-- ════════════════════════════════════════════════════════════════
--  CATALOGUE PRODUITS — table « products » (extensible)
--  À exécuter dans Supabase → SQL Editor (idempotent).
--  Le code utilise par défaut le catalogue interne (src/data/products.ts) ;
--  cette table permet de gérer/étendre le catalogue côté cloud.
-- ════════════════════════════════════════════════════════════════

create table if not exists public.products (
  id              text primary key,
  name            text not null,
  brand           text not null,
  category        text not null,            -- cream|serum|oil|balm|mask|supplement|tool|wellness
  need            text not null,            -- besoin principal
  also_helps      text[] not null default '{}',
  price           numeric,
  rating          numeric,
  review_count    integer default 0,
  labels          text[] not null default '{}',
  image_url       text,
  link            text,
  affiliate_url   text,
  ingredients     text[] not null default '{}',
  key_ingredients jsonb  not null default '[]',  -- [{ "name":..., "benefit":... }]
  application     text,
  skin_types      text[],                   -- null = tous types
  gender          text default 'all',       -- female|male|all
  vegan           boolean default false,
  is_routine      boolean default false,    -- solution complète (routine globale)
  created_at      timestamptz not null default now()
);

create index if not exists products_need_idx on public.products (need);

-- Catalogue PUBLIC : lecture autorisée pour tous ; écriture réservée au
-- service role (dashboard / import). Aucune policy insert/update côté client.
alter table public.products enable row level security;
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select using (true);

-- ── Seed du catalogue curé (upsert idempotent) ─────────────────────
insert into public.products
  (id, name, brand, category, need, also_helps, price, rating, review_count, labels, link, ingredients, key_ingredients, application, skin_types, gender, vegan, is_routine)
values
  ('collagene-matcha','Collagène Matcha','Matcha & Co','supplement','imperfections','{hydration,radiance}',29,4.5,320,'{Vegan}','https://matchandco.fr/products/collagene-matcha','{matcha,"collagene marin","acide hyaluronique","vitamine c"}','[{"name":"Matcha","benefit":"antioxydant, apaise les imperfections"},{"name":"Collagène","benefit":"soutient fermeté et hydratation"}]','1 dose/jour en cure.','{normal,combination,oily,dry}','all',true,false),
  ('az-niacinamide-cuivre-zinc','Sérum Niacinamide 10%, Cuivre & Zinc','Aroma-Zone','serum','imperfections','{pigmentation,mattifying}',12,4.5,1800,'{Vegan}','https://www.aroma-zone.com/info/fiche-technique/serum-concentre-niacinamide-cuivre-zinc-aroma-zone','{niacinamide,"zinc pca",cuivre,aqua,glycerin}','[{"name":"Niacinamide 10%","benefit":"régule le sébum, resserre les pores, atténue rougeurs et taches"},{"name":"Zinc","benefit":"purifie et apaise"}]','Le soir, avant la crème.','{oily,combination,normal}','all',true,false),
  ('az-zinc-salicylique','Crème fluide Zinc hyaluronate & Acide salicylique','Aroma-Zone','cream','imperfections','{mattifying,skin_renewal}',11,4.4,740,'{Bio,Cosmébio}','https://www.aroma-zone.com/info/fiche-technique/base-neutre-fluide-purifiant-hydratant-bio','{"zinc hyaluronate","acide salicylique",aqua,glycerin}','[{"name":"Acide salicylique","benefit":"désincruste les pores, lisse le grain"},{"name":"Zinc","benefit":"matifie"}]','Matin et/ou soir sur les zones à pores.','{oily,combination}','all',true,false),
  ('sephora-spot-stop','The Spot Stop — Solution AHA/PHA','Sephora','serum','imperfections','{skin_renewal}',16,4.3,210,'{Vegan}','https://www.sephora.fr/p/the-spot-stop-%E2%80%93-solution-aha-pha-contre-les-impuretes-762583.html','{aha,pha,aqua,glycerin}','[{"name":"AHA / PHA","benefit":"exfolient en douceur, désincrustent"}]','Le soir, localement.','{oily,combination,normal}','all',true,false),
  ('az-routine-in-out-imperfections','Routine globale In & Out anti-imperfections','Aroma-Zone','wellness','imperfections','{mattifying,pigmentation,wellness}',45,4.5,260,'{Bio,Cosmébio}','https://www.aroma-zone.com/info/fiche-technique/routine-globale-anti-imperfections-in-out','{zinc,niacinamide,"plantes purifiantes"}','[{"name":"Routine interne + externe","benefit":"agit de l''intérieur et en surface"}]','Routine complète guidée sur plusieurs semaines.','{oily,combination,normal}','all',true,true),
  ('typology-anti-marques','Sérum Anti-Marques','Typology','serum','post_acne_marks','{pigmentation}',29,4.6,950,'{Vegan,Cruelty-free}','https://www.typology.com/products/serum-anti-marques','{niacinamide,"tranexamic acid",aqua,glycerin}','[{"name":"Niacinamide","benefit":"atténue les marques, unifie"},{"name":"Acide tranexamique","benefit":"cible les taches résiduelles"}]','Matin et soir sur les marques, puis SPF le jour.','{normal,combination,oily,dry}','all',true,false),
  ('az-contour-cafeine-helichryse','Sérum Contour des yeux Caféine & Hélichryse','Aroma-Zone','serum','eye_care','{}',13,4.4,1100,'{Bio,Cosmébio}','https://www.aroma-zone.com/info/fiche-technique/serum-contour-des-yeux-5-cafeine-helichryse','{caffeine,helichrysum,aqua,glycerin}','[{"name":"Caféine 5%","benefit":"décongestionne, atténue cernes et poches"},{"name":"Hélichryse","benefit":"effet tenseur"}]','Matin, tapoter sur le contour de l''œil.','{normal,dry,combination,sensitive,oily}','all',true,false),
  ('garnier-yeux-vitc','Soin Yeux Booster d''Éclat Vitamine C','Garnier','serum','eye_care','{radiance}',10,4.3,1500,'{Vegan}','https://www.garnier.fr/nos-marques/soin-du-visage/vitamine-c/soin-yeux-booster-declat','{"vitamine c",caffeine,aqua,glycerin}','[{"name":"Vitamine C","benefit":"réveille l''éclat, atténue la fatigue"}]','Matin sur le contour de l''œil.','{normal,combination,oily,dry}','all',true,false),
  ('sephora-masques-yeux','Masques Yeux Défatigants (bio-cellulose)','Sephora','mask','eye_care','{}',6,4.4,420,'{Vegan}','https://www.sephora.fr/p/masques-yeux-defatigants---masques-bio-cellulose-P10057545.html','{"acide hyaluronique",aqua,glycerin}','[{"name":"Bio-cellulose + AH","benefit":"coup de frais immédiat"}]','5 minutes, en coup d''éclat.','{normal,dry,combination,sensitive,oily}','all',true,false),
  ('typology-jour-spf50','Crème de Jour Multi-Signes SPF 50','Typology','cream','anti_aging','{pigmentation,sun_protection}',25,4.6,880,'{Vegan,Cruelty-free}','https://www.typology.com/products/creme-de-jour-multi-signes-de-l-age-spf-50-complexe-de-peptides','{peptides,"spf 50",glycerin,aqua}','[{"name":"Complexe de peptides","benefit":"lisse rides et relâchement"},{"name":"SPF 50","benefit":"protège des UV"}]','Le matin, en dernière étape.','{normal,combination,dry,sensitive}','all',true,false),
  ('az-vitc-astaxanthine','Sérum Vitamine C 10% Astaxanthine','Aroma-Zone','serum','anti_aging','{radiance,firmness}',15,4.5,690,'{Vegan}','https://www.aroma-zone.com/info/fiche-technique/serum-concentre-vitamine-c-10-astaxanthine-aroma-zone','{"vitamine c",astaxanthine,aqua,glycerin}','[{"name":"Vitamine C 10%","benefit":"éclat, ferme, défroisse"},{"name":"Astaxanthine","benefit":"antioxydant anti-âge"}]','Le matin avant la crème + SPF.','{normal,combination,dry,oily}','all',true,false),
  ('az-jeunesse-rose-ah','Crème Jeunesse Rose musquée & AH','Aroma-Zone','cream','anti_aging','{hydration}',14,4.5,540,'{Bio,Cosmébio}','https://www.aroma-zone.com/info/fiche-technique/creme-neutre-jeunesse-bio-aroma-zone','{"rosa moschata seed oil","acide hyaluronique",aqua,glycerin}','[{"name":"Rose musquée","benefit":"régénère et repulpe"},{"name":"Acide hyaluronique","benefit":"comble les ridules"}]','Matin et soir.','{normal,dry,combination}','all',true,false),
  ('az-huile-rose-musquee','Huile Rose musquée de Patagonie BIO','Aroma-Zone','oil','anti_aging','{post_acne_marks,hydration}',13,4.7,2100,'{Bio,Ecocert}','https://www.aroma-zone.com/info/fiche-technique/huile-de-soin-rose-musquee-de-patagonie-bio-aroma-zone','{"rosa moschata seed oil",tocopherol}','[{"name":"Rose musquée","benefit":"régénère, atténue marques et rides"}]','Le soir, 3–4 gouttes.','{normal,dry,combination}','all',true,false),
  ('az-huile-argan','Huile Argan du Maroc BIO','Aroma-Zone','oil','hydration','{anti_aging}',11,4.7,2400,'{Bio,Ecocert}','https://www.aroma-zone.com/info/fiche-technique/huile-de-soin-argan-du-maroc-bio-aroma-zone','{"argania spinosa kernel oil",tocopherol}','[{"name":"Argan","benefit":"nourrit les peaux sèches/dévitalisées"}]','Le soir, quelques gouttes.','{dry,normal,sensitive}','all',true,false),
  ('matcha-facial-glow','Facial Glow Serum','Matcha & Co','serum','radiance','{firmness,anti_aging}',27,4.5,280,'{Vegan}','https://matchandco.fr/products/facial-glow-serum','{matcha,"vitamine c","acide hyaluronique",aqua}','[{"name":"Matcha + Vitamine C","benefit":"illumine, raffermit, anti-photovieillissement"}]','Le matin avant la crème.','{normal,combination,dry,oily}','all',true,false),
  ('az-gommage-grenade-riz','Gommage Enzyme de grenade & perles de riz','Aroma-Zone','mask','skin_renewal','{radiance}',10,4.5,620,'{Bio,Cosmébio}','https://www.aroma-zone.com/info/fiche-technique/gommage-visage-enzyme-de-grenade-perles-de-riz','{"enzyme de grenade","poudre de riz",aqua,glycerin}','[{"name":"Enzymes de grenade","benefit":"exfolient sans grains agressifs"}]','1×/semaine, 5 min puis rincer.','{normal,combination,oily,sensitive}','all',true,false),
  ('az-poudre-papaye-vitc','Poudre nettoyante enzymatique Papaye & Vitamine C','Aroma-Zone','mask','radiance','{skin_renewal}',9,4.4,380,'{Bio,Cosmébio}','https://www.aroma-zone.com/info/fiche-technique/base-neutre-poudre-nettoyante-enzymatique-papaye-vitamine-c','{papaye,"vitamine c","poudre nettoyante"}','[{"name":"Papaye + Vitamine C","benefit":"désincruste, ravive l''éclat"}]','2–3×/semaine, masser puis rincer.','{normal,combination,oily}','all',true,false),
  ('sephora-rice-honey-glow','Ground Rice and Honey Glow Mask','Sephora','mask','radiance','{hydration}',12,4.4,300,'{Vegan}','https://www.sephora.fr/p/ground-rice-and-honey-glow-mask---masque-eclat-tout-en-un-761489.html','{"poudre de riz",miel,aqua,glycerin}','[{"name":"Riz + Miel","benefit":"illumine et hydrate"}]','1–2×/semaine, 10 min.','{normal,dry,combination,sensitive}','all',true,false),
  ('az-desalterante','Crème Désaltérante BIO (hydratation 8h)','Aroma-Zone','cream','hydration','{}',12,4.5,980,'{Bio,Cosmébio}','https://www.aroma-zone.com/info/fiche-technique/creme-neutre-desalterante-bio-aroma-zone','{"aloe barbadensis leaf juice",glycerin,aqua}','[{"name":"Aloe vera","benefit":"hydrate jusqu''à 8h, apaise"}]','Matin et soir.','{normal,dry,combination,sensitive}','all',true,false),
  ('embryolisse-lait-creme','Lait-Crème Concentré','Embryolisse','cream','hydration','{}',18,4.7,5200,'{Cruelty-free}','https://embryolisse.fr/products/lait-creme-concentre','{"beurre de karite","aloe barbadensis leaf juice",glycerin,aqua}','[{"name":"Karité + Aloe","benefit":"hydratation immédiate, base de maquillage"}]','Matin et soir, ou masque 10 min.','{normal,dry,combination,sensitive}','all',false,false),
  ('nutripure-huile-coco','Huile de coco vierge BIO','Nutripure','oil','hydration','{body_hydration}',14,4.6,410,'{Bio}','https://www.nutripure.fr/fr/alimentation-saine/26-410-huile-coco-vierge-bio.html','{"cocos nucifera oil"}','[{"name":"Coco vierge","benefit":"nourrit peau et cheveux"}]','Sur les zones sèches.','{dry,normal}','all',true,false),
  ('avene-cleanance-spf50','Cleanance Solaire SPF 50+','Avène','cream','sun_protection','{imperfections,mattifying}',16,4.6,1300,'{Cruelty-free}','https://www.my-origines.com/fr/solaire-cleanance-P0454004.html','{"filtres uv",monolaurine,aqua}','[{"name":"SPF 50+ matifiant","benefit":"protège les peaux à imperfections"}]','Le matin, à renouveler.','{oily,combination}','all',false,false),
  ('lrp-anthelios-uvmune','Anthelios UVMUNE 400 SPF50+','La Roche-Posay','cream','sun_protection','{anti_aging,pigmentation}',20,4.7,3100,'{Cruelty-free}','https://www.laroche-posay.fr/offres/offres-french-days/anthelios-uvmune-400-creme-solaire-fluide-invisible-spf50-/3337875797580.html','{"mexoryl 400","filtres uv",aqua}','[{"name":"Mexoryl 400","benefit":"protège des UV longs (taches, vieillissement)"}]','Le matin, à renouveler.','{normal,combination,sensitive,dry,oily}','all',false,false),
  ('sephora-gua-sha','Gua Sha Quartz Rose','Sephora','tool','contour','{firmness}',15,4.5,650,'{}','https://www.sephora.fr/p/gua-sha-quartz-rose---visage-et-cou-532082.html','{}','[{"name":"Massage gua sha","benefit":"tonifie, lisse, draine le contour"}]','Sur huile/sérum, 5 min, mouvements ascendants.',null,'all',false,false),
  ('jawliner-3','Jawliner 3.0','Jawliner','tool','contour','{}',30,4.3,1200,'{}','https://jawliner.com/fr/products/jawliner-3-0','{}','[{"name":"Entraînement mâchoire","benefit":"travaille la ligne de mâchoire"}]','Quelques minutes par jour.',null,'all',false,false),
  ('az-serum-cils-ricin','Sérum cils fortifiant au Ricin BIO','Aroma-Zone','serum','hair','{}',8,4.4,900,'{Bio}','https://www.aroma-zone.com/info/fiche-technique/serum-cils-au-ricin','{"huile de ricin",tocopherol}','[{"name":"Huile de ricin","benefit":"fortifie, volume et longueur des cils"}]','Le soir, au pinceau.',null,'all',true,false),
  ('az-duo-cheveux-antichute','Duo Cheveux Anti-Chute & Croissance','Aroma-Zone','serum','hair','{}',22,4.3,340,'{Bio}','https://www.aroma-zone.com/info/fiche-technique/duo-cheveux-anti-chute-croissance','{"actifs cheveux",aqua}','[{"name":"Duo anti-chute","benefit":"limite la chute, stimule la croissance"}]','En cure, massage du cuir chevelu.',null,'all',false,false),
  ('az-serum-keratine-peptides','Sérum Cheveux Kératine AA & Peptides','Aroma-Zone','serum','hair','{}',16,4.4,260,'{}','https://www.aroma-zone.com/info/fiche-technique/serum-cheveux-keratine-aa-peptides','{keratine,peptides,aqua}','[{"name":"Kératine + Peptides","benefit":"répare la fibre capillaire"}]','Sur longueurs et pointes.',null,'all',false,false),
  ('az-huile-barbe','Huile à barbe Acide hyaluronique & Chanvre BIO','Aroma-Zone','oil','beard','{}',12,4.4,230,'{Bio}','https://www.aroma-zone.com/info/fiche-technique/huile-a-barbe-acide-hyaluronique-chanvre-bio','{"huile de chanvre","acide hyaluronique",tocopherol}','[{"name":"Chanvre + AH","benefit":"nourrit la barbe, hydrate la peau"}]','Quelques gouttes sur barbe propre.',null,'male',true,false),
  ('nutripure-magnesium','Magnésium³ Poudre','Nutripure','supplement','wellness','{}',19,4.7,1600,'{}','https://www.nutripure.fr/fr/sante/251-magnesium-poudre.html','{magnesium,taurine,"vitamine b6"}','[{"name":"Magnésium (3 formes)","benefit":"réduit fatigue et stress"}]','1 dose/jour en cure.',null,'all',true,false),
  ('dailylab-lacher-prise','Complexe Lâcher Prise','Daily Lab','supplement','wellness','{}',24,4.5,410,'{Vegan}','https://dailylab.com/products/complexe-lacher-prise','{"plantes adaptogenes",magnesium}','[{"name":"Plantes adaptogènes","benefit":"aide à gérer le stress"}]','En cure, selon posologie.',null,'all',true,false)
on conflict (id) do update set
  name = excluded.name, brand = excluded.brand, category = excluded.category,
  need = excluded.need, also_helps = excluded.also_helps, price = excluded.price,
  rating = excluded.rating, review_count = excluded.review_count,
  labels = excluded.labels, link = excluded.link, ingredients = excluded.ingredients,
  key_ingredients = excluded.key_ingredients, application = excluded.application,
  skin_types = excluded.skin_types, gender = excluded.gender, vegan = excluded.vegan,
  is_routine = excluded.is_routine;
