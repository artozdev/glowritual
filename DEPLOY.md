# Mettre Glow en ligne (accessible à tous)

Glow est une app **React + Vite** (site statique) + **Supabase** (auth, base, stockage).
Pour la rendre publique : (1) configurer Supabase, (2) déployer le site.

---

## 1. Supabase (backend)

1. **Projet** : déjà créé → `https://gcgxefbwgxjmxuozowxx.supabase.co`.
2. **Schéma** : Dashboard → **SQL Editor → New query** → colle tout
   [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
   (Crée tables, RLS, bucket chiffré `scans`, trigger profil, affiliation,
   codes promo… avec toutes les contraintes.)
3. **Auth email** : Authentication → Providers → **Email** activé.
   Pour des inscriptions instantanées, tu peux désactiver « Confirm email ».
4. **URLs autorisées** : Authentication → URL Configuration →
   ajoute l'URL de ton site déployé dans **Site URL** + **Redirect URLs**
   (ex. `https://glow.vercel.app`).
5. **Clés** : Project Settings → **API** →
   - **Project URL** → `VITE_SUPABASE_URL`
   - clé **Publishable / anon** (`sb_publishable_…` ou JWT `eyJ…`) → `VITE_SUPABASE_ANON_KEY`

> ⚠️ N'utilise **jamais** la clé *secret* (`sb_secret_…`) côté site — uniquement la publishable.

---

## 2. Variables d'environnement

```dotenv
VITE_SUPABASE_URL=https://gcgxefbwgxjmxuozowxx.supabase.co
VITE_SUPABASE_ANON_KEY=<ta clé publishable>
```

En local : dans `.env`. En production : à renseigner dans le dashboard de l'hébergeur.
Dès que ces deux variables sont présentes, l'app bascule automatiquement de
« mode démo » (local) vers **Supabase réel**.

---

## 3. Déploiement du site

Le build : `npm run build` → dossier `dist/`. Routing SPA déjà configuré
(`vercel.json`, `netlify.toml`, `public/_redirects`).

### Option A — Vercel (recommandé)
1. Pousse le repo sur GitHub.
2. vercel.com → **Add New → Project** → importe le repo.
3. Framework **Vite** détecté (build `npm run build`, output `dist`).
4. **Environment Variables** : ajoute les 2 variables ci-dessus.
5. **Deploy**. → URL publique `https://…vercel.app`.

### Option B — Netlify
1. app.netlify.com → **Add new site → Import an existing project**.
2. Build command `npm run build`, publish directory `dist`.
3. **Environment variables** : ajoute les 2 variables.
4. **Deploy**.

### Option C — CLI rapide
```bash
npm run build
npx vercel --prod      # ou : npx netlify deploy --prod --dir=dist
```

---

## 4. Après déploiement
- Crée un compte sur le site en ligne → vérifie qu'une ligne apparaît dans
  `auth.users` **et** `public.profiles`.
- Mets à jour **Site URL / Redirect URLs** dans Supabase avec l'URL finale.
- (Optionnel) domaine personnalisé `glow.app` via l'hébergeur.
