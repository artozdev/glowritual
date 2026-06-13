# Configuration Supabase — Glow

L'app fonctionne en **mode démo** sans Supabase. Pour activer les comptes réels,
le stockage chiffré et la persistance, suivez ces étapes.

## 1. Créer le projet

1. Allez sur [supabase.com](https://supabase.com) → **New project**.
2. Notez l'**URL du projet** et la **clé anon publique** :
   *Project Settings → API*.

## 2. Renseigner les variables d'environnement

À la racine du repo, copiez le modèle puis remplissez vos valeurs :

```bash
cp .env.example .env
```

```dotenv
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

> Dès que ces deux variables sont présentes, l'app bascule automatiquement
> de « mode démo » vers l'auth Supabase réelle. Redémarrez `npm run dev`.

## 3. Créer le schéma

Dans le dashboard : **SQL Editor → New query**, collez le contenu de
[`schema.sql`](./schema.sql) puis exécutez. Cela crée :

- les tables `profiles`, `scans`, `scan_points`, `routines`, `routine_tasks` ;
- la **RLS** (chaque utilisateur n'accède qu'à ses données) ;
- le **bucket privé `scans`** (chiffré au repos) + ses policies ;
- le **trigger** qui crée le profil à chaque inscription.

## 4. Auth par email

*Authentication → Providers → Email* : activez **Email**.
Pour tester rapidement sans boîte mail, désactivez « Confirm email »
(*Authentication → Providers → Email → Confirm email*).

## 5. Vérifier

Relancez l'app, créez un compte : une ligne doit apparaître dans
`auth.users` **et** `public.profiles`. La RLS garantit que chaque requête
ne renvoie que les données de l'utilisateur connecté.
