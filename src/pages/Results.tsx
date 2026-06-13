import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ScanFace,
  CalendarHeart,
  RotateCcw,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CriterionRadar } from '@/components/results/CriterionRadar';
import { InteractivePoint } from '@/components/results/InteractivePoint';
import { PointDetailSheet } from '@/components/results/PointDetailSheet';
import { CRITERION_ICON } from '@/components/results/criterionMeta';
import { MedicalDisclaimer } from '@/components/common/MedicalDisclaimer';
import { useScanSession } from '@/hooks/useScanSession';
import { scoreHeadline, formatDate } from '@/lib/utils';
import type { CriterionResult } from '@/types/domain';

export default function Results() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const { getScan, latest } = useScanSession();
  const [selected, setSelected] = useState<CriterionResult | null>(null);

  const scan = scanId ? getScan(scanId) : latest;

  // Aucun scan disponible → invitation à scanner.
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
          Lancez votre premier scan pour découvrir vos points à sublimer.
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

  const { analysis, overall, image, createdAt } = scan;
  const strengths = analysis.criteria.filter((c) => c.score >= 80).length;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-sage-900">
            Vos points à sublimer
          </h1>
          <p className="mt-1 text-sm text-sage-500">
            Analyse du {formatDate(createdAt)} ·{' '}
            {scan.kind === 'face' ? 'Visage' : 'Corps'}
          </p>
        </div>
        <Link to="/scan" className="hidden sm:block">
          <Button variant="outline" size="sm">
            <RotateCcw className="h-4 w-4" />
            Nouveau scan
          </Button>
        </Link>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {/* Photo + points interactifs */}
        <Card className="overflow-hidden p-3">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-gradient-to-b from-sage-100 to-beige-100">
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
                  Photo non conservée — vos points restent visibles.
                </p>
              </div>
            )}

            {analysis.criteria.map((c, i) => (
              <InteractivePoint
                key={c.id}
                criterion={c}
                index={i}
                active={selected?.id === c.id}
                onClick={() => setSelected(c)}
              />
            ))}
          </div>
          <p className="mt-2 text-center text-xs text-sage-400">
            Touchez un point vert pour voir le détail.
          </p>
        </Card>

        {/* Score global + radar */}
        <div className="flex flex-col gap-5">
          <Card className="flex items-center gap-5 p-5">
            <ScoreRing value={overall} size={120} />
            <div>
              <p className="text-lg font-semibold text-sage-900">
                {scoreHeadline(overall)}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-sage-600">
                {strengths} point{strengths > 1 ? 's' : ''} fort
                {strengths > 1 ? 's' : ''} détecté{strengths > 1 ? 's' : ''}.
                Continuez en douceur, vous êtes sur la bonne voie.
              </p>
            </div>
          </Card>

          <Card className="p-4">
            <p className="px-1 text-sm font-semibold text-sage-900">
              Équilibre par critère
            </p>
            <CriterionRadar criteria={analysis.criteria} />
          </Card>
        </div>
      </div>

      {/* Liste des critères */}
      <h2 className="mt-8 text-lg font-semibold text-sage-900">Le détail</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {analysis.criteria.map((c, i) => {
          const Icon = CRITERION_ICON[c.id];
          return (
            <motion.button
              key={c.id}
              type="button"
              onClick={() => setSelected(c)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              className="flex items-center gap-3 rounded-2xl border border-beige-200/70 bg-white p-4 text-left shadow-soft transition-colors hover:border-sage-200"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sage-50">
                <Icon className="h-5 w-5 text-sage-500" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-sage-900">
                    {c.label}
                  </p>
                  <span className="text-sm font-semibold text-sage-700">
                    {c.score}
                  </span>
                </div>
                <ProgressBar value={c.score} className="mt-1.5 h-1.5" />
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-sage-300" />
            </motion.button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button className="w-full sm:flex-1" onClick={() => navigate('/routine')}>
          <CalendarHeart className="h-5 w-5" />
          Générer ma routine
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
