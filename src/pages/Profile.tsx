import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LogOut,
  Sparkles,
  ShieldCheck,
  Trash2,
  Crown,
  Leaf,
  AlertTriangle,
  Gift,
  ChevronRight,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { ProfilePreferences } from '@/components/profile/ProfilePreferences';
import { MedicalDisclaimer } from '@/components/common/MedicalDisclaimer';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useScanSession } from '@/hooks/useScanSession';
import { deleteAllUserData } from '@/lib/userData';
import { openBillingPortal } from '@/lib/stripeClient';

export default function Profile() {
  const { user, signOut, isConfigured } = useAuth();
  const { profile, reset } = useProfile();
  const { clearAll } = useScanSession();
  const navigate = useNavigate();

  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [portalBusy, setPortalBusy] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  async function handleManageSubscription() {
    setPortalError(null);
    setPortalBusy(true);
    try {
      await openBillingPortal();
    } catch (e) {
      setPortalError((e as Error).message || 'Portail indisponible pour le moment.');
      setPortalBusy(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate('/', { replace: true });
  }

  async function handleDeleteAll() {
    setDeleting(true);
    // Session démo → pas d'userId réel : suppression locale.
    await deleteAllUserData(user && !user.isDemo ? user.id : undefined);
    clearAll();
    reset();
    await signOut();
    setDeleting(false);
    navigate('/', { replace: true });
  }

  const displayName = profile.displayName.trim();
  const initial = (displayName[0] ?? user?.email?.[0] ?? 'N').toUpperCase();
  const isPremium = user?.plan === 'premium';

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-sage-900">
        Mon profil
      </h1>
      <p className="mt-1 text-sage-600">Votre compte et vos préférences.</p>

      {/* Identité */}
      <Card className="mt-6 p-5">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-gradient text-xl font-semibold text-sage-700 shadow-soft">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-sage-900">
              {displayName || user?.email || 'Invité'}
            </p>
            {displayName && user?.email && (
              <p className="truncate text-xs text-sage-400">{user.email}</p>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  isPremium
                    ? 'bg-sage-600 text-white'
                    : 'bg-beige-100 text-sage-600'
                }`}
              >
                {isPremium ? (
                  <>
                    <Crown className="h-3 w-3" /> Premium
                  </>
                ) : (
                  'Offre gratuite'
                )}
              </span>
              {user?.isDemo && (
                <span className="inline-flex items-center gap-1 rounded-full bg-beige-100 px-2.5 py-0.5 text-xs font-medium text-sage-500">
                  <Leaf className="h-3 w-3" /> Session démo
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Préférences (pilotent analyses, scoring et recommandations) */}
      <div className="mt-4">
        <ProfilePreferences />
      </div>

      {/* Programme ambassadeur */}
      <Link to="/ambassador" className="mt-4 block">
        <Card className="flex items-center justify-between gap-4 p-5 transition-colors hover:border-sage-200">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sage-50">
              <Gift className="h-5 w-5 text-sage-500" />
            </span>
            <div>
              <p className="font-semibold text-sage-900">Programme ambassadeur</p>
              <p className="text-sm text-sage-600">
                Ton code promo −15 % à partager, et tes récompenses.
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-sage-300" />
        </Card>
      </Link>

      {/* Abonnement */}
      {isPremium ? (
        <Card className="mt-4 p-5">
          <h2 className="flex items-center gap-2 font-semibold text-sage-900">
            <Crown className="h-4 w-4 text-gold" />
            Mon abonnement
          </h2>
          <p className="mt-1.5 text-sm text-sage-600">
            Vous êtes Premium ✨ Gérez votre formule, votre moyen de paiement ou
            résiliez via le portail sécurisé Stripe.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={handleManageSubscription}
            disabled={portalBusy}
          >
            {portalBusy ? 'Ouverture…' : 'Gérer mon abonnement'}
          </Button>
          {portalError && (
            <p className="mt-2 text-xs text-red-500">{portalError}</p>
          )}
        </Card>
      ) : (
        <Card className="mt-4 overflow-hidden">
          <div className="flex items-center justify-between gap-4 bg-sage-gradient p-5">
            <div>
              <p className="flex items-center gap-2 font-semibold text-sage-900">
                <Sparkles className="h-4 w-4 text-sage-500" />
                Passez en Premium
              </p>
              <p className="mt-1 text-sm text-sage-600">
                Résultats complets, routines illimitées et suivi avant/après.
              </p>
            </div>
            <Link to="/pricing">
              <Button size="sm">Découvrir</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Confidentialité */}
      <Card className="mt-4 p-5">
        <h2 className="flex items-center gap-2 font-semibold text-sage-900">
          <ShieldCheck className="h-4 w-4 text-sage-500" />
          Confidentialité
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-sage-600">
          {isConfigured
            ? 'Vos images sont stockées de façon privée et chiffrée. Vous seul·e y avez accès (RLS activé).'
            : 'En mode démo, vos données ne quittent pas cet appareil.'}
        </p>
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-beige-200 bg-beige-50 p-3.5">
          <div className="flex items-center gap-2.5">
            <Trash2 className="h-4 w-4 text-sage-500" />
            <div>
              <p className="text-sm font-medium text-sage-800">
                Supprimer toutes mes données
              </p>
              <p className="text-xs text-sage-400">
                Scans, points, routines et compte — irréversible.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowDelete(true)}
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            Supprimer
          </Button>
        </div>
      </Card>

      {/* Déconnexion */}
      <Button
        variant="outline"
        className="mt-4 w-full"
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4" />
        Se déconnecter
      </Button>

      <MedicalDisclaimer className="mt-6" compact />

      {/* Confirmation de suppression */}
      <Sheet
        open={showDelete}
        onClose={() => !deleting && setShowDelete(false)}
        ariaLabel="Supprimer toutes mes données"
      >
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </span>
          <h3 className="mt-4 text-lg font-semibold text-sage-900">
            Supprimer toutes vos données ?
          </h3>
          <p className="mx-auto mt-1.5 max-w-xs text-sm text-sage-600">
            Scans, points, routines, préférences et compte seront effacés
            définitivement. Cette action est irréversible.
          </p>
          <Button
            className="mt-5 w-full bg-red-500 hover:bg-red-600 focus-visible:ring-red-300"
            onClick={handleDeleteAll}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? 'Suppression…' : 'Supprimer définitivement'}
          </Button>
          <button
            type="button"
            onClick={() => setShowDelete(false)}
            disabled={deleting}
            className="mt-3 text-sm font-medium text-sage-500 hover:text-sage-700 disabled:opacity-50"
          >
            Annuler
          </button>
        </div>
      </Sheet>
    </div>
  );
}
