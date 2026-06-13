import {
  Droplets,
  Sun,
  Eye,
  Sparkles,
  Smile,
  Scale,
  PersonStanding,
  Dumbbell,
  Waves,
  type LucideIcon,
} from 'lucide-react';
import type { CriterionId } from '@/types/domain';

/** Icône associée à chaque critère (couche UI, hors moteur d'analyse). */
export const CRITERION_ICON: Record<CriterionId, LucideIcon> = {
  hydration: Droplets,
  glow: Sun,
  dark_circles: Eye,
  skin_texture: Sparkles,
  lip_brow_care: Smile,
  symmetry: Scale,
  posture: PersonStanding,
  tone: Dumbbell,
  skin_hydration: Waves,
};
