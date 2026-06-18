# Abonnements Stripe — passage en LIVE (paiements réels)

Glow gère le Premium via **Stripe Checkout + webhook**, backend en **Vercel
Functions** (`/api/stripe/*`). Le statut Premium vit dans la table Supabase
`subscriptions` (écrite uniquement par le webhook → non falsifiable côté client).

> ⚠️ **Mode LIVE = vrais paiements et vrais débits.** Tout est séparé du mode
> test : clés (`sk_live_…`), prix, webhook (`whsec_…`) et portail sont distincts.
> Active bien **Live mode** (toggle en haut du dashboard) avant chaque étape.

---

## 0. Activer ton compte Stripe (obligatoire en live)
Dashboard → **Activate / Complete account** : renseigne l'entreprise (ou
auto-entrepreneur), l'adresse, ton **IBAN** (pour les virements) et l'identité.
Tant que le compte n'est pas activé, les clés `sk_live_…` refusent les paiements.

## 1. Supabase — table des abonnements (si pas déjà fait)
SQL Editor → colle [`supabase/migration_subscriptions.sql`](supabase/migration_subscriptions.sql) → **Run**.
Récupère la clé **service role** : Project Settings → API → `service_role`.

## 2. Stripe LIVE — produit, prix & webhook (script recommandé)
Passe le dashboard en **Live mode**, puis Developers → API keys → copie la
**Secret key** `sk_live_…`.

Le plus simple — lance le script avec ta clé **live** (elle reste sur ta machine) :
```bash
cd ~/Documents/NaturalMe
STRIPE_SECRET_KEY=sk_live_xxx node scripts/setup-stripe.mjs
```
Le script affiche `Stripe LIVE ⚠️`, crée le produit **Glow Premium**, les 2 prix
(**16 €/mois** et **149 €/an**) et l'**endpoint webhook**, puis imprime :
```
STRIPE_PRICE_MONTHLY=price_…
STRIPE_PRICE_ANNUAL=price_…
STRIPE_WEBHOOK_SECRET=whsec_…   (live)
```

<details>
<summary>…ou à la main dans le dashboard (Live mode)</summary>

1. **Products → Add product** « Glow Premium » + 2 prix récurrents
   `16 € / month` et `149 € / year` → note les `price_…`.
2. **Developers → Webhooks → Add endpoint** : `https://glowritual.io/api/stripe/webhook`,
   événements `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted` → copie le **Signing secret** `whsec_…`.
</details>

## 3. Vercel — variables d'environnement (Production)
Projet Vercel → Settings → **Environment Variables** :

| Name | Valeur (LIVE) |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_…` |
| `STRIPE_PRICE_MONTHLY` | `price_…` (mensuel, live) |
| `STRIPE_PRICE_ANNUAL` | `price_…` (annuel, live) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` (live) |
| `SUPABASE_URL` | `https://gcgxefbwgxjmxuozowxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | clé `service_role` (étape 1) |
| `SITE_URL` | `https://glowritual.io` |

> ⚠️ Ne mets JAMAIS `sk_live_…` ni la `service_role` dans une variable
> `VITE_…` (celles-là sont envoyées au navigateur). Uniquement côté serveur.

## 4. Stripe — portail client (Live mode)
Settings → **Billing → Customer portal** → active-le **en mode Live** (réglage
distinct du mode test) : autorise l'annulation et le changement de formule.

## 5. Redeploy
Après ajout/maj des variables d'env, **redeploy** sur Vercel (les fonctions
lisent les variables au démarrage).

## 6. Vérification en conditions réelles
1. Sur `https://glowritual.io` : connecte-toi → **Pricing → Passer au Premium**.
2. Paie avec une **vraie carte** (c'est un débit réel — tu peux **rembourser**
   ensuite depuis Stripe → Payments, ou **résilier** via le portail).
3. Retour sur `/pricing?checkout=success` → le webhook écrit dans `subscriptions`
   → ton statut passe **Premium**, les résultats se débloquent.
4. **Profil → Gérer mon abonnement** ouvre le portail Stripe (résilier / changer).
5. Contrôle : Stripe → **Developers → Webhooks** → l'événement doit être en
   **200** (sinon vérifie `STRIPE_WEBHOOK_SECRET` et le redeploy).

---

## Bon à savoir en live
- **Reçus & emails** : Stripe envoie automatiquement les reçus de paiement.
- **Devise** : EUR (définie sur les prix).
- **Remboursement / résiliation** : depuis le dashboard (Payments) ou le portail
  client. La résiliation déclenche `customer.subscription.deleted` → retour au
  plan gratuit automatiquement.
- **TVA** (optionnel) : active **Stripe Tax** si tu dois collecter la TVA.
- **Mentions légales / CGV** : recommandé d'ajouter des CGV et une politique de
  remboursement avant d'encaisser des clients réels.

## Revenir en test
Relance le tout avec les clés `sk_test_…` (le script recrée prix + webhook en
test) et repointe temporairement les variables Vercel — test et live coexistent
sans se mélanger.
