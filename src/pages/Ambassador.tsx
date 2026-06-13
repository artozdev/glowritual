import { useState } from 'react';
import {
  Gift,
  Sparkles,
  Copy,
  Check,
  Share2,
  Users,
  Wallet,
  Link2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { usePromo } from '@/hooks/usePromo';
import { DISCOUNT_PERCENT } from '@/lib/ambassador';

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-sage-700 shadow-soft transition-colors hover:bg-sage-50"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-sage-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copié' : label}
    </button>
  );
}

export default function Ambassador() {
  const { isAmbassador, myCode, stats, becomeAmbassador, shareLink } = usePromo();

  // ── Pas encore ambassadeur : pitch + activation.
  if (!isAmbassador || !myCode) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl bg-sage-gradient p-7 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-soft">
            <Gift className="h-7 w-7 text-sage-500" />
          </span>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-sage-900">
            Deviens ambassadeur Glow
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sage-700">
            Partage Glow avec ta communauté grâce à ton code promo perso de
            −{DISCOUNT_PERCENT} %, et sois récompensé·e à chaque utilisation.
          </p>
          <Button size="lg" className="mt-6" onClick={() => becomeAmbassador()}>
            <Sparkles className="h-5 w-5" />
            Obtenir mon code
          </Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Gift, t: `−${DISCOUNT_PERCENT} % offerts`, d: 'à ta communauté, sur le Premium.' },
            { icon: Wallet, t: 'Récompenses', d: 'à chaque utilisation de ton code.' },
            { icon: Users, t: 'Suivi en direct', d: 'utilisations et gains, en temps réel.' },
          ].map(({ icon: Icon, t, d }) => (
            <Card key={t} className="p-4">
              <Icon className="h-5 w-5 text-sage-500" />
              <p className="mt-2 text-sm font-semibold text-sage-900">{t}</p>
              <p className="text-xs text-sage-500">{d}</p>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ── Ambassadeur : code, partage, stats.
  const link = shareLink(myCode.code);

  async function nativeShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Glow',
          text: `Profite de −${DISCOUNT_PERCENT} % sur Glow avec mon code ${myCode!.code} ✨`,
          url: link,
        });
      }
    } catch {
      /* annulé */
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight text-sage-900">
        Mon espace ambassadeur
      </h1>
      <p className="mt-1 text-sage-600">
        Ton code offre −{DISCOUNT_PERCENT} % et t'attribue chaque utilisation.
      </p>

      {/* Code */}
      <Card className="mt-6 overflow-hidden">
        <div className="bg-sage-gradient p-6 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-sage-600">
            Ton code promo
          </p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-sage-900">
            {myCode.code}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <CopyButton value={myCode.code} label="Copier le code" />
            <CopyButton value={link} label="Copier le lien" />
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                type="button"
                onClick={nativeShare}
                className="inline-flex items-center gap-1.5 rounded-xl bg-sage-500 px-3 py-2 text-xs font-semibold text-white shadow-soft hover:bg-sage-600"
              >
                <Share2 className="h-3.5 w-3.5" />
                Partager
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-3 text-xs text-sage-500">
          <Link2 className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{link}</span>
        </div>
      </Card>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Card className="p-5 text-center">
          <Users className="mx-auto h-5 w-5 text-sage-500" />
          <p className="mt-2 text-3xl font-semibold text-sage-900">
            {stats.uses}
          </p>
          <p className="text-xs text-sage-500">Utilisations</p>
        </Card>
        <Card className="p-5 text-center">
          <Wallet className="mx-auto h-5 w-5 text-sage-500" />
          <p className="mt-2 text-3xl font-semibold text-sage-900">
            {stats.rewardEur} €
          </p>
          <p className="text-xs text-sage-500">Récompenses estimées</p>
        </Card>
      </div>

      {/* Comment ça marche */}
      <Card className="mt-4 p-5">
        <h2 className="text-sm font-semibold text-sage-900">Comment ça marche</h2>
        <ol className="mt-3 space-y-2.5">
          {[
            'Partage ton code ou ton lien avec ta communauté.',
            `Tes abonné·es profitent de −${DISCOUNT_PERCENT} % à leur première souscription.`,
            'Chaque utilisation t’est attribuée et compte pour tes récompenses.',
          ].map((t, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-sage-700">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-500 text-xs font-bold text-white">
                {i + 1}
              </span>
              {t}
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
