/**
 * Création automatique du produit + des 2 prix Glow Premium dans Stripe.
 *
 * 🔐 La clé secrète est lue depuis l'environnement — elle n'est JAMAIS écrite
 *    dans ce fichier ni commitée. Lance le script ainsi (mode test) :
 *
 *      STRIPE_SECRET_KEY=sk_test_xxx node scripts/setup-stripe.mjs
 *
 * Idempotent : relançable sans créer de doublons (basé sur les lookup_key).
 * Affiche à la fin les STRIPE_PRICE_MONTHLY / STRIPE_PRICE_ANNUAL à coller
 * dans les variables d'environnement Vercel.
 */
import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error('❌ STRIPE_SECRET_KEY manquante.');
  console.error('   Usage : STRIPE_SECRET_KEY=sk_test_xxx node scripts/setup-stripe.mjs');
  process.exit(1);
}
if (!key.startsWith('sk_')) {
  console.error('❌ Utilise la clé SECRÈTE Stripe (sk_test_… ou sk_live_…), pas une clé publishable.');
  process.exit(1);
}

const stripe = new Stripe(key);
const live = key.startsWith('sk_live_');

const PLANS = [
  { lookup: 'glow_premium_monthly', label: 'mensuel', amount: 999, interval: 'month' },
  { lookup: 'glow_premium_annual', label: 'annuel', amount: 5990, interval: 'year' },
];

/** Récupère un prix existant par lookup_key, ou le crée (sur un produit donné). */
async function ensurePrice(productId, plan) {
  const found = await stripe.prices.list({ lookup_keys: [plan.lookup], limit: 1 });
  if (found.data[0]) {
    console.log(`• Prix ${plan.label} déjà présent : ${found.data[0].id}`);
    return found.data[0];
  }
  const price = await stripe.prices.create({
    product: productId,
    currency: 'eur',
    unit_amount: plan.amount,
    recurring: { interval: plan.interval },
    lookup_key: plan.lookup,
    nickname: `Glow Premium (${plan.label})`,
  });
  console.log(`• Prix ${plan.label} créé : ${price.id} (${(plan.amount / 100).toFixed(2)} € / ${plan.interval})`);
  return price;
}

async function main() {
  console.log(`\n🔌 Stripe ${live ? 'LIVE ⚠️' : 'TEST'} — configuration de Glow Premium\n`);

  // Réutilise le produit d'un prix existant, sinon en crée un.
  const existing = await stripe.prices.list({ lookup_keys: ['glow_premium_monthly'], limit: 1, expand: ['data.product'] });
  let productId = existing.data[0]?.product?.id;
  if (!productId) {
    const product = await stripe.products.create({
      name: 'Glow Premium',
      description: 'Analyse complète, routines illimitées et suivi des progrès.',
    });
    productId = product.id;
    console.log(`• Produit créé : ${product.id}`);
  } else {
    console.log(`• Produit existant : ${productId}`);
  }

  const [monthly, annual] = [await ensurePrice(productId, PLANS[0]), await ensurePrice(productId, PLANS[1])];

  // Webhook : créé s'il n'existe pas (le secret whsec_ n'est révélé qu'à la création).
  const site = process.env.SITE_URL || 'https://glowritual.io';
  const url = `${site}/api/stripe/webhook`;
  const events = [
    'checkout.session.completed',
    'customer.subscription.updated',
    'customer.subscription.deleted',
  ];
  const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
  const existingHook = endpoints.data.find((e) => e.url === url);
  let webhookSecret = null;
  if (existingHook) {
    console.log(`• Webhook déjà présent : ${existingHook.id} (secret déjà généré précédemment)`);
  } else {
    const hook = await stripe.webhookEndpoints.create({ url, enabled_events: events });
    webhookSecret = hook.secret;
    console.log(`• Webhook créé : ${hook.id}`);
  }

  console.log('\n✅ Terminé. Colle ces variables dans Vercel :\n');
  console.log(`STRIPE_PRICE_MONTHLY=${monthly.id}`);
  console.log(`STRIPE_PRICE_ANNUAL=${annual.id}`);
  if (webhookSecret) console.log(`STRIPE_WEBHOOK_SECRET=${webhookSecret}`);
  else console.log('STRIPE_WEBHOOK_SECRET=<déjà créé : récupère-le dans Stripe → Webhooks, ou supprime l’endpoint et relance>');
  console.log('\n(Pense aussi à STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,');
  console.log(' SITE_URL — cf. STRIPE.md. Active enfin le portail client dans Stripe → Billing.)\n');
}

main().catch((e) => {
  console.error('❌ Erreur Stripe :', e.message);
  process.exit(1);
});
