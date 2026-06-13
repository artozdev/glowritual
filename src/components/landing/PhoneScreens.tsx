import { useState } from 'react';
import {
  ChevronLeft,
  MoreHorizontal,
  ScanFace,
  Droplets,
  Sun,
  Eye,
  Sparkles,
  Heart,
  Image as ImageIcon,
  Zap,
  Check,
  Sunrise,
  Moon,
  Star,
  ExternalLink,
  TrendingUp,
  Leaf,
} from 'lucide-react';
import { StatusBar } from './PhoneFrame';
import { Img } from './Img';
import { PORTRAIT, PRODUCT_FALLBACK, BEFORE_AFTER } from './media';
import { PRODUCTS } from '@/data/products';

function Face({ className }: { className?: string }) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-b from-mint-soft to-sand ${className ?? ''}`}>
        <ScanFace className="h-20 w-20 text-forest/25" strokeWidth={0.8} />
      </div>
    );
  }
  return (
    <img
      src={PORTRAIT}
      alt="Visage scanné"
      onError={() => setError(true)}
      className={`object-cover ${className ?? ''}`}
    />
  );
}

/** Écran « Scanner » : caméra + repère + barre d'outils. */
export function ScanScreen() {
  return (
    <div className="relative h-full w-full bg-[#111418]">
      <Face className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/45" />

      <div className="relative z-10 flex h-full flex-col">
        <StatusBar dark />
        <div className="flex items-center justify-between px-4 py-2 text-white">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
            <ChevronLeft className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold">Scanner</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
            <MoreHorizontal className="h-4 w-4" />
          </span>
        </div>

        {/* Repère de cadrage */}
        <div className="relative flex-1">
          <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2">
            {['left-0 top-0 rounded-tl-lg border-l-2 border-t-2', 'right-0 top-0 rounded-tr-lg border-r-2 border-t-2', 'left-0 bottom-0 rounded-bl-lg border-b-2 border-l-2', 'right-0 bottom-0 rounded-br-lg border-b-2 border-r-2'].map(
              (p, i) => (
                <span key={i} className={`absolute h-6 w-6 border-mint ${p}`} />
              ),
            )}
            {[
              { top: '20%', left: '30%' },
              { top: '30%', left: '70%' },
              { top: '62%', left: '48%' },
            ].map((pt, i) => (
              <span
                key={i}
                className="absolute h-2.5 w-2.5 rounded-full bg-mint ring-4 ring-mint/30"
                style={pt}
              />
            ))}
          </div>
        </div>

        {/* Barre d'outils */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between rounded-full bg-white/90 p-1.5 backdrop-blur">
            <span className="flex items-center gap-1.5 rounded-full bg-forest px-3 py-1.5 text-[11px] font-semibold text-mint">
              <ScanFace className="h-3.5 w-3.5" /> Scan visage
            </span>
            <span className="flex items-center gap-2 pr-2 text-forest/70">
              <ImageIcon className="h-4 w-4" />
              <Sparkles className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-center justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white">
              <span className="h-9 w-9 rounded-full bg-white" />
            </span>
          </div>
          <div className="absolute bottom-6 left-5">
            <Zap className="h-4 w-4 text-white/80" />
          </div>
        </div>
      </div>
    </div>
  );
}

const METRICS = [
  { icon: Droplets, label: 'Hydratation', value: '82' },
  { icon: Sun, label: 'Éclat', value: '76' },
  { icon: Eye, label: 'Cernes', value: '71' },
  { icon: Sparkles, label: 'Texture', value: '80' },
];

/** Écran « Analyse » : score + critères détaillés. */
export function ResultScreen() {
  return (
    <div className="flex h-full w-full flex-col bg-white">
      {/* Bandeau visage */}
      <div className="relative h-36 w-full shrink-0">
        <Face className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20" />
        <div className="relative z-10">
          <StatusBar dark />
          <div className="flex items-center justify-between px-4 py-1.5 text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25">
              <ChevronLeft className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold">Analyse</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25">
              <MoreHorizontal className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>

      {/* Feuille de résultats */}
      <div className="-mt-4 flex-1 rounded-t-3xl bg-white px-4 pt-4">
        <p className="text-[10px] font-medium uppercase tracking-wide text-forest/50">
          Visage · Matin
        </p>
        <div className="mt-1 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-forest/60">Score Glow</p>
            <p className="text-3xl font-bold text-forest">86</p>
          </div>
          <span className="rounded-full bg-mint px-3 py-1 text-[11px] font-semibold text-forest">
            Belle mine ✨
          </span>
        </div>

        {/* Grille de critères */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {METRICS.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-2xl border border-forest/10 p-2.5"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mint-soft">
                <Icon className="h-3.5 w-3.5 text-forest" />
              </span>
              <div className="leading-tight">
                <p className="text-[9px] text-forest/55">{label}</p>
                <p className="text-sm font-bold text-forest">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Glow score */}
        <div className="mt-2.5 flex items-center gap-2 rounded-2xl border border-forest/10 p-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mint-soft">
            <Heart className="h-3.5 w-3.5 text-forest" />
          </span>
          <div className="flex-1">
            <p className="text-[9px] text-forest/55">Glow score</p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-forest/10">
              <div className="h-full w-4/5 rounded-full bg-forest-light" />
            </div>
          </div>
          <span className="text-xs font-bold text-forest">8/10</span>
        </div>

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          <span className="flex flex-1 items-center justify-center gap-1 rounded-full border border-forest/15 py-2 text-[11px] font-semibold text-forest">
            <Sparkles className="h-3 w-3" /> Affiner
          </span>
          <span className="flex flex-1 items-center justify-center rounded-full bg-forest py-2 text-[11px] font-semibold text-sand">
            Terminé
          </span>
        </div>
      </div>
    </div>
  );
}

const ROUTINE = [
  { icon: Sunrise, title: 'Hydrater le visage', time: 'Matin', done: true },
  { icon: Sun, title: 'Sérum éclat vitamine C', time: 'Matin', done: true },
  { icon: Moon, title: 'Huile de jojoba', time: 'Soir', done: false },
  { icon: Sparkles, title: 'Gommage doux', time: 'Hebdo', done: false },
];

/** Écran « Ma routine » : tâches planifiées + complétion. */
export function RoutineScreen() {
  return (
    <div className="flex h-full w-full flex-col bg-sand">
      <StatusBar />
      <div className="px-4 pb-2 pt-1">
        <p className="text-[10px] font-medium uppercase tracking-wide text-forest/50">
          Aujourd’hui
        </p>
        <p className="text-lg font-bold text-forest">Ma routine</p>
        {/* Bande de jours */}
        <div className="mt-2 flex justify-between">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
            <span
              key={i}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold ${
                i === 2 ? 'bg-forest text-mint' : 'bg-white text-forest/60'
              }`}
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-2 px-4">
        {ROUTINE.map(({ icon: Icon, title, time, done }) => (
          <div
            key={title}
            className="flex items-center gap-2.5 rounded-2xl bg-white p-2.5 shadow-soft"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mint-soft">
              <Icon className="h-3.5 w-3.5 text-forest" />
            </span>
            <div className="flex-1 leading-tight">
              <p className="text-[11px] font-semibold text-forest">{title}</p>
              <p className="text-[9px] text-forest/50">{time}</p>
            </div>
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                done ? 'border-forest bg-forest text-mint' : 'border-forest/25'
              }`}
            >
              {done && <Check className="h-3 w-3" strokeWidth={3} />}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Petit en-tête commun. */
function ScreenHeader({ title, dark = false }: { title: string; dark?: boolean }) {
  const c = dark ? 'text-white' : 'text-forest';
  const bg = dark ? 'bg-white/25' : 'bg-forest/5';
  return (
    <div className={`flex items-center justify-between px-4 py-2 ${c}`}>
      <span className={`flex h-7 w-7 items-center justify-center rounded-full ${bg}`}>
        <ChevronLeft className="h-4 w-4" />
      </span>
      <span className="text-sm font-semibold">{title}</span>
      <span className={`flex h-7 w-7 items-center justify-center rounded-full ${bg}`}>
        <MoreHorizontal className="h-4 w-4" />
      </span>
    </div>
  );
}

/** Écran « Analyse point par point » : points numérotés + fiche ouverte. */
export function AnalyseScreen() {
  const points = [
    { n: 1, top: '24%', left: '34%' },
    { n: 2, top: '40%', left: '64%' },
    { n: 3, top: '60%', left: '46%' },
  ];
  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="relative h-44 w-full shrink-0">
        <Face className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/15" />
        <div className="relative z-10">
          <StatusBar dark />
          <ScreenHeader title="Analyse" dark />
        </div>
        {points.map((p) => (
          <span
            key={p.n}
            className="absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-mint text-[10px] font-bold text-forest ring-4 ring-mint/30"
            style={{ top: p.top, left: p.left }}
          >
            {p.n}
          </span>
        ))}
      </div>

      <div className="-mt-3 flex-1 rounded-t-3xl bg-white px-4 pt-4">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-mint text-[10px] font-bold text-forest">
            2
          </span>
          <p className="text-sm font-semibold text-forest">Cernes</p>
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <p className="text-3xl font-bold text-forest">71</p>
          <p className="text-sm font-medium text-forest/50">/100</p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-forest/10">
          <div className="h-full w-[71%] rounded-full bg-forest-light" />
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-forest/70">
          Vos yeux trahissent un peu de fatigue — rien qu’un bon repos ne
          sublime.
        </p>
        <div className="mt-3 flex items-start gap-2 rounded-2xl bg-mint-soft p-2.5">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest" />
          <p className="text-[11px] font-medium leading-snug text-forest">
            Conseil : 7–8 h de sommeil + contour de l’œil à l’huile d’amande
            douce.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Écran « Produit recommandé ». */
export function ProductScreen() {
  const p =
    PRODUCTS.find((x) => x.id === 'radiance-serum-vitc') ?? PRODUCTS[0]!;
  return (
    <div className="flex h-full w-full flex-col bg-white">
      <StatusBar />
      <ScreenHeader title="Recommandé" />
      <div className="flex-1 px-4 pb-3">
        <div className="overflow-hidden rounded-2xl bg-sand">
          <Img
            primary={p.imageUrl}
            fallback={PRODUCT_FALLBACK}
            alt={p.name}
            className="aspect-[5/4] w-full object-cover"
          />
        </div>
        <p className="mt-3 text-[10px] font-medium uppercase tracking-wide text-forest/50">
          {p.brand}
        </p>
        <p className="text-sm font-bold leading-snug text-forest">{p.name}</p>
        <div className="mt-1.5 flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 fill-gold text-gold" />
          <span className="text-xs font-semibold text-forest">{p.rating}</span>
          <span className="text-[11px] text-forest/50">
            ({p.reviewCount.toLocaleString('fr-FR')} avis)
          </span>
          <span className="ml-auto text-sm font-bold text-forest">{p.price} €</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {p.labels.slice(0, 2).map((l) => (
            <span
              key={l}
              className="inline-flex items-center gap-1 rounded-full bg-mint px-2 py-0.5 text-[9px] font-semibold text-forest"
            >
              <Leaf className="h-2.5 w-2.5" /> {l}
            </span>
          ))}
        </div>
        <button className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-forest py-2.5 text-[11px] font-semibold text-sand">
          <ExternalLink className="h-3.5 w-3.5" /> Voir le produit
        </button>
      </div>
    </div>
  );
}

/** Écran « Suivi des progrès » : courbe + avant/après. */
export function ProgressScreen() {
  return (
    <div className="flex h-full w-full flex-col bg-white">
      <StatusBar />
      <ScreenHeader title="Progrès" />
      <div className="flex-1 px-4">
        <p className="text-[10px] font-medium uppercase tracking-wide text-forest/50">
          Score Glow
        </p>
        <div className="flex items-center gap-2">
          <p className="text-3xl font-bold text-forest">86</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-mint px-2 py-0.5 text-[10px] font-bold text-forest">
            <TrendingUp className="h-3 w-3" /> +14
          </span>
        </div>

        {/* Courbe */}
        <div className="mt-2 rounded-2xl border border-forest/10 p-3">
          <svg viewBox="0 0 100 44" className="h-20 w-full" preserveAspectRatio="none">
            <polyline
              points="0,38 20,32 40,30 60,20 80,14 100,6"
              fill="none"
              stroke="#2E5D4B"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {[[0,38],[40,30],[80,14],[100,6]].map(([x,y],i)=>(
              <circle key={i} cx={x} cy={y} r="2.4" fill="#2E5D4B" />
            ))}
          </svg>
        </div>

        {/* Avant / Après */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            { src: BEFORE_AFTER.before, fb: BEFORE_AFTER.beforeFallback, label: 'Avant', score: '72' },
            { src: BEFORE_AFTER.after, fb: BEFORE_AFTER.afterFallback, label: 'Après', score: '86' },
          ].map((c) => (
            <div key={c.label} className="overflow-hidden rounded-2xl border border-forest/10">
              <div className="relative aspect-[4/3]">
                <Img primary={c.src} fallback={c.fb} alt={c.label} className="absolute inset-0 h-full w-full object-cover" />
                <span className="absolute left-1.5 top-1.5 rounded-full bg-white/85 px-1.5 py-0.5 text-[9px] font-semibold text-forest">
                  {c.label}
                </span>
              </div>
              <div className="flex items-center justify-between px-2 py-1.5">
                <span className="text-[9px] text-forest/50">Score</span>
                <span className="text-xs font-bold text-forest">{c.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
