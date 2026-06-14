# Abonnements Stripe — mise en place

Glow gère le Premium via **Stripe Checkout + webhook**, avec un backend en
**Vercel Functions** (`/api/stripe/*`). Le statut Premium vit dans la table
Supabase `subscriptions` (écrite uniquement par le webhook) → non falsifiable
côté client.

> On commence en **mode TEST** (clés `sk_test_…`, cartes de test). Bascule en
> live une fois le parcours validé.

---

## 1. Supabase — table des abonnements
SQL Editor → New query → colle [`supabase/migration_subscriptions.sql`](supabase/migration_subscriptions.sql) → **Run**.

Récupère aussi la **clé service role** : Project Settings → API →
`service_role` (secret). Elle ne sert QUE côté serveur (webhook).

## 2. Stripe — produit & prix (mode Test)
1. [dashboard.stripe.com](https://dashboard.stripe.com) → active **Test mode** (toggle en haut).
2. **Products → Add product** : « Glow Premium ».
3. Ajoute **deux prix récurrents** :
   - **Mensuel** : `9,99 €` / `month` → note l'ID `price_…` → `STRIPE_PRICE_MONTHLY`
   - **Annuel** : `59,90 €` / `year` → note l'ID `price_…` → `STRIPE_PRICE_ANNUAL`
4. Developers → **API keys** → copie la **Secret key** `sk_test_…` → `STRIPE_SECRET_KEY`.

## 3. Vercel — variables d'environnement
Projet Vercel → Settings → **Environment Variables** (Production) :

| Name | Valeur |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_…` |
| `STRIPE_PRICE_MONTHLY` | `price_…` (mensuel) |
| `STRIPE_PRICE_ANNUAL` | `price_…` (annuel) |
| `SUPABASE_URL` | `https://gcgxefbwgxjmxuozowxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | clé `service_role` (étape 1) |
| `SITE_URL` | `https://glowritual.io` |
| `STRIPE_WEBHOOK_SECRET` | *(rempli à l'étape 4)* |

> ⚠️ Ne mets JAMAIS `sk_test_…` ni la `service_role` dans une variable
> `VITE_…` (celles-là sont envoyées au navigateur).

## 4. Stripe — webhook
1. Developers → **Webhooks → Add endpoint**.
2. URL : `https://glowritual.io/api/stripe/webhook`
3. Événements à écouter :
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Crée l'endpoint → copie le **Signing secret** `whsec_…` →
   variable `STRIPE_WEBHOOK_SECRET` dans Vercel.

## 5. Stripe — portail client
Settings → **Billing → Customer portal** → active-le (mode Test) et autorise
l'annulation / le changement de formule. (Sert au bouton « Gérer mon abonnement ».)

## 6. Redéploie
Après avoir ajouté/changé des variables d'env, **redeploy** sur Vercel
(les fonctions lisent les variables au démarrage).

## 7. Test du parcours (carte de test)
1. Sur le site : connecte-toi → **Pricing → Passer au Premium** (mensuel ou annuel).
2. Sur Stripe Checkout, paie avec **`4242 4242 4242 4242`**, date future, CVC quelconque.
3. Retour sur `/pricing?checkout=success` → le webhook écrit dans `subscriptions`
   → ton statut passe **Premium**, les résultats se débloquent.
4. **Profil → Gérer mon abonnement** ouvre le portail Stripe (résilier/changer).

### Astuce debug webhook (optionnel)
Avec la Stripe CLI : `stripe listen --forward-to https://glowritual.io/api/stripe/webhook`
puis `stripe trigger checkout.session.completed`.

---

## Passage en live
Refais les étapes 2→4 en **mode Live** (clés `sk_live_…`, nouveaux `price_…`,
nouveau webhook `whsec_…`), mets à jour les variables Vercel, redeploy.

## Récapitulatif des prix
| Formule | Affichage | Débité |
|---|---|---|
| Mensuel | 9,99 €/mois | 9,99 € / mois |
| Annuel | 4,99 €/mois (**−50 %**) | **59,90 € une fois / an** |
