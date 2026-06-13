import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  Target,
  ListChecks,
  ShoppingBag,
  Star,
  ExternalLink,
  Leaf,
  type LucideIcon,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/Checkbox';
import { BuyLink } from '@/components/common/BuyLink';
import { useProfile } from '@/hooks/useProfile';
import { recommendProductForNeed } from '@/lib/recommendationEngine';
import { cn } from '@/lib/utils';
import type { GeneratedTask } from '@/types/domain';
import type { Product } from '@/types/products';

interface Props {
  task: GeneratedTask;
  done: boolean;
  onToggle: () => void;
}

/** Bloc « Objectif / Comment faire ». */
function Detail({
  icon: Icon,
  label,
  text,
}: {
  icon: LucideIcon;
  label: string;
  text: string;
}) {
  return (
    <div>
      <p className="mb-0.5 flex items-center gap-1.5 text-xs font-semibold text-sage-700">
        <Icon className="h-3.5 w-3.5 text-sage-500" />
        {label}
      </p>
      <p className="text-xs leading-relaxed text-sage-600">{text}</p>
    </div>
  );
}

/** Vignette produit (image + repli feuille). */
function ProductThumb({ product }: { product: Product }) {
  const [err, setErr] = useState(false);
  return (
    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-sage-100">
      {!err ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          onError={() => setErr(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center">
          <Leaf className="h-5 w-5 text-sage-400" />
        </span>
      )}
    </div>
  );
}

/**
 * Tâche de routine dépliable : case à cocher + explication concrète
 * (objectif, comment faire) et, le cas échéant, où trouver le produit adapté.
 */
export function TaskItem({ task, done, onToggle }: Props) {
  const [open, setOpen] = useState(false);
  const { profile } = useProfile();

  const product = useMemo(
    () =>
      task.productNeed
        ? recommendProductForNeed(task.productNeed, profile)
        : null,
    [task.productNeed, profile],
  );

  return (
    <div
      className={cn(
        'rounded-2xl border transition-colors',
        done ? 'border-sage-100 bg-sage-50/60' : 'border-beige-200/70 bg-white',
      )}
    >
      <div className="flex items-start gap-3 p-3.5">
        <Checkbox checked={done} onChange={onToggle} label={task.title} />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex items-center justify-between gap-2">
            <p
              className={cn(
                'text-sm font-medium transition-colors',
                done ? 'text-sage-400 line-through' : 'text-sage-900',
              )}
            >
              {task.title}
            </p>
            <ChevronDown
              className={cn(
                'h-4 w-4 shrink-0 text-sage-400 transition-transform',
                open && 'rotate-180',
              )}
            />
          </div>
          <p className="mt-0.5 text-xs leading-relaxed text-sage-500">
            {task.detail}
          </p>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-3 px-3.5 pb-3.5 pl-12">
              <Detail icon={Target} label="Objectif" text={task.goal} />
              <Detail icon={ListChecks} label="Comment faire" text={task.how} />

              {task.productNeed && product ? (
                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-sage-700">
                    <ShoppingBag className="h-3.5 w-3.5 text-sage-500" />
                    Où trouver le produit
                  </p>
                  <BuyLink
                    product={product}
                    className="flex items-center gap-3 rounded-2xl border border-beige-200 bg-beige-50 p-2.5 transition-colors hover:bg-beige-100"
                  >
                    <ProductThumb product={product} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-wide text-sage-400">
                        {product.brand}
                      </p>
                      <p className="truncate text-sm font-medium text-sage-900">
                        {product.name}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-sage-500">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {product.rating} · {product.price} €
                      </div>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-sage-600">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Voir
                    </span>
                  </BuyLink>
                </div>
              ) : (
                !task.productNeed && (
                  <Detail
                    icon={Leaf}
                    label="Astuce"
                    text="Aucun produit nécessaire — c’est un geste bien-être à intégrer au quotidien."
                  />
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
