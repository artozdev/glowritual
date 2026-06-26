import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ScanFace,
  CalendarHeart,
  RotateCcw,
  Sparkles,
  Sun,
  Moon,
  CalendarDays,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { CriterionRadar } from '@/components/results/CriterionRadar';
import { InteractivePoint } from '@/components/results/InteractivePoint';
import { PointDetailSheet } from '@/components/results/PointDetailSheet';
import { LockedResults } from '@/components/results/LockedResults';
import { ProductCard } from '@/components/results/ProductCard';
import { PlanTabs } from '@/components/plan/PlanTabs';
import { ZonePlan } from '@/components/plan/ZonePlan';
import { ProgressionPlan } from '@/components/plan/ProgressionPlan';
import { LifestyleTips } from '@/components/plan/LifestyleTips';
import { ANGLE_META } from '@/lib/scanAngles';
import { MedicalDisclaimer } from '@/components/common/MedicalDisclaimer';
import { useScanSession } from '@/hooks/useScanSession';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { recommendRoutine } from '@/lib/recommendationEngine';
import { generateRoutine, groupByPeriod } from '@/lib/routine-generator';
import { overviewSplit } from '@/lib/glowPlan';
import { scoreHeadline, formatDate } from '@/lib/utils';
import type { CriterionResult, RoutinePeriod } from '@/types/domain';

const TABS = [
  { id: 'overview', label: "Vue d'ensemble" },
  { id: 'zones', label: 'Par zone' },
  { id: 'routine', label: 'Routine' },
  { id: 'progression', label: 'Progression' },
  { id: 'bienetre', label: 'Bien-être' },
];

const PERIOD_META: Record<RoutinePeriod, { label: string; Icon: typeof Sun }> = {
  morning: { label: 'Matin', Icon: Sun },
  evening: { label: 'Soir', Icon: Moon },
  weekly: { label: 'Hebdo', Icon: CalendarDays },
};

export default function Results() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const { getScan, latest, hydrated, history } = useScanSession();
  const { user, isConfigured } = useAuth();
  const { profile } = useProfile();
  const [selected, setSelected] = useState<CriterionResult | null>(null);

  const scan = scanId ? getScan(scanId) : latest;
  const analysis = scan?.analysis;
  const locked = isConfigured && user?.plan !== 'premium';

  // Hooks calculés AVANT tout retour anticipé (règles des hooks).
  const overview = useMemo(
    () => (analysis ? overviewSplit(analysis) : { strengths: [], priorities: [] }),
    [analysis],
  );
  const routineByPeriod = useMemo(
    () =>
      scan
        ? groupByPeriod(generateRoutine(scan.id, scan.analysis, profile))
        : { morning: [], evening: [], weekly: [] },
    [scan, profile],
  );
  const routineProduct = useMemo(
    () => (analysis ? recommendRoutine(analysis.criteria, profile) : null),
    [analysis, profile],
  );

  // Ancres depuis la sidebar (#zones, #routine…) → défilement vers la section.
  const location = useLocation();
  useEffect(() => {
    if (!location.hash || !scan) return;
    const id = location.hash.slice(1);
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el)
        window.scrollTo({
          top: el.getBoundingClientRect().top + window.scrollY - 90,
          behavior: 'smooth',
        });
    });
  }, [location.hash, scan?.id]);

  if (!scan && !hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-sage-200 border-t-sage-500" />
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-sage-50">
          <ScanFace className="h-7 w-7 text-sage-500" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold text-sage-900">
          Aucune analyse pour l’instant
        </h1>
        <p className="mt-2 text-sage-600">
          Lancez votre premier scan pour découvrir votre Glow Plan.
        </p>
        <Link to="/scan" className="mt-6 inline-block">
          <Button size="lg">
            <ScanFace className="h-5 w-5" />
            Commencer mon analyse
          </Button>
        </Link>
      </div>
    );
  }

  if (locked) return <LockedResults scan={scan} />;

  const { overall, image, createdAt } = scan;
  const criteria = analysis!.criteria;

  return (
    <div className="mx-auto max-w-3xl lg:max-w-6xl">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-sage-900">
            Ton Glow Plan
          </h1>
          <p className="mt-1 text-sm text-sage-500">
            Établi le {formatDate(createdAt)} · {scan.kind === 'face' ? 'Visage' : 'Corps'}
          </p>
        </div>
        <Link to="/scan" className="hidden sm:block">
          <Button variant="outline" size="sm">
            <RotateCcw className="h-4 w-4" />
            Nouveau scan
          </Button>
        </Link>
      </div>

      <PlanTabs tabs={TABS} />

      {/* ── 1. Vue d'ensemble ─────────────────────────────────────── */}
      <section id="overview" className="mt-6 scroll-mt-24">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="flex items-center gap-5 p-5">
            <ScoreRing value={overall} size={116} />
            <div>
              <p className="text-lg font-semibold text-sage-900">
                {scoreHeadline(overall)}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-sage-600">
                Voici ton point de départ — on va le faire évoluer ensemble, en
                douceur. 🌿
              </p>
            </div>
          </Card>

          <Card className="p-4">
            <p className="px-1 text-sm font-semibold text-sage-900">
              Équilibre par zone
            </p>
            <CriterionRadar criteria={criteria} />
          </Card>
        </div>

        {overview.strengths.length > 0 && (
          <div className="mt-4">
            <h2 className="text-sm font-semibold text-sage-900">
              Ce qui fonctionne déjà bien chez toi ✨
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {overview.strengths.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelected(c)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-sage-50 px-3 py-1.5 text-sm font-medium text-sage-700 transition-colors hover:bg-sage-100"
                >
                  {c.label}
                  <span className="text-sage-400">{c.score}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5">
          <h2 className="text-sm font-semibold text-sage-900">
            Tes 3 priorités à sublimer
          </h2>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {overview.priorities.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelected(c)}
                className="rounded-2xl border border-beige-200 bg-white p-3 text-left shadow-soft transition-colors hover:border-sage-200"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sage-300 text-xs font-bold text-sage-900">
                  {i + 1}
                </span>
                <p className="mt-2 text-sm font-semibold text-sage-900">
                  {c.label}
                </p>
                <p className="text-xs text-sage-500">Score {c.score}/100</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. Plan par zone ──────────────────────────────────────── */}
      <section id="zones" className="mt-10 scroll-mt-24">
        <h2 className="text-lg font-semibold text-sage-900">Plan par zone</h2>
        <p className="mt-1 text-sm text-sage-500">
          Touche un point sur ta photo, ou déplie une zone pour ton plan détaillé.
        </p>

        <div className="mt-3 lg:grid lg:grid-cols-[minmax(0,360px)_1fr] lg:items-start lg:gap-5">
          <div className="lg:sticky lg:top-24">
            <Card className="overflow-hidden p-3">
              <div className="relative mx-auto aspect-[3/4] max-w-xs overflow-hidden rounded-2xl bg-gradient-to-b from-sage-100 to-beige-100 lg:max-w-none">
                {image ? (
                  <img
                    src={image}
                    alt="Votre capture"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                    <ScanFace className="h-20 w-20 text-sage-300" strokeWidth={1} />
                    <p className="max-w-[12rem] text-xs text-sage-400">
                      Photo non conservée — tes points restent visibles.
                    </p>
                  </div>
                )}
                {criteria.map((c, i) => (
                  <InteractivePoint
                    key={c.id}
                    criterion={c}
                    index={i}
                    active={selected?.id === c.id}
                    onClick={() => setSelected(c)}
                  />
                ))}
              </div>
            </Card>

            {/* Photos multi-angles capturées */}
            {scan.angles && scan.angles.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {scan.angles.map((a) => (
                  <div
                    key={a.id}
                    className="overflow-hidden rounded-xl border border-beige-200 bg-white"
                  >
                    <div className="relative aspect-square bg-gradient-to-b from-sage-100 to-beige-100">
                      {a.image && (
                        <img
                          src={a.image}
                          alt={ANGLE_META[a.id].label}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <p className="truncate px-1.5 py-1 text-center text-[10px] font-medium text-sage-500">
                      {ANGLE_META[a.id].label}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 lg:mt-0">
            <ZonePlan criteria={criteria} profile={profile} />
          </div>
        </div>
      </section>

      {/* ── 3. Routine structurée ─────────────────────────────────── */}
      <section id="routine" className="mt-10 scroll-mt-24">
        <h2 className="text-lg font-semibold text-sage-900">
          Ta routine, matin · soir · hebdo
        </h2>
        <p className="mt-1 text-sm text-sage-500">
          Ton plan se traduit en gestes simples, reliés au calendrier et au suivi.
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {(['morning', 'evening', 'weekly'] as RoutinePeriod[]).map((period) => {
            const { label, Icon } = PERIOD_META[period];
            const tasks = routineByPeriod[period];
            return (
              <Card key={period} className="p-4">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-sage-900">
                  <Icon className="h-4 w-4 text-sage-500" />
                  {label}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {tasks.length > 0 ? (
                    tasks.map((t) => (
                      <li
                        key={t.id}
                        className="flex items-start gap-1.5 text-sm text-sage-600"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage-300" />
                        {t.title}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-sage-400">—</li>
                  )}
                </ul>
              </Card>
            );
          })}
        </div>

        {routineProduct && (
          <Card className="mt-3 border-sage-200 bg-sage-50/60 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-sage-900">
              <Sparkles className="h-4 w-4 text-sage-500" />
              Ta solution complète
            </p>
            <p className="mt-1 text-sm text-sage-600">
              Une routine naturelle qui couvre plusieurs de tes besoins d’un coup.
            </p>
            <div className="mt-3">
              <ProductCard rec={routineProduct} />
            </div>
          </Card>
        )}

        <Link to="/routine" className="mt-3 block">
          <Button variant="outline" className="w-full">
            <CalendarHeart className="h-4 w-4" />
            Ouvrir ma routine complète
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* ── 4. Plan de progression ────────────────────────────────── */}
      <section id="progression" className="mt-10 scroll-mt-24">
        <h2 className="text-lg font-semibold text-sage-900">
          Ton plan de progression
        </h2>
        <p className="mt-1 text-sm text-sage-500">
          Étape par étape, avec des rescans pour mesurer tes vrais progrès.
        </p>
        <div className="mt-3">
          <ProgressionPlan history={history} />
        </div>
      </section>

      {/* ── 5. Conseils transverses (hygiène de vie) ──────────────── */}
      <section id="bienetre" className="mt-10 scroll-mt-24">
        <h2 className="text-lg font-semibold text-sage-900">
          Ton bien-être au quotidien
        </h2>
        <p className="mt-1 text-sm text-sage-500">
          De petites habitudes qui soutiennent ta peau, en plus de ta routine.
        </p>
        <div className="mt-3">
          <LifestyleTips profile={profile} />
        </div>
      </section>

      {/* Actions */}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button className="w-full sm:flex-1" onClick={() => navigate('/routine')}>
          <CalendarHeart className="h-5 w-5" />
          Suivre ma routine
        </Button>
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => navigate('/scan')}
        >
          <Sparkles className="h-4 w-4" />
          Refaire un scan
        </Button>
      </div>

      <MedicalDisclaimer className="mt-6" />

      <PointDetailSheet criterion={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
