import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'sage' | 'beige' | 'success' | 'muted';

const tones: Record<Tone, string> = {
  sage: 'bg-sage-300 text-sage-900',
  beige: 'bg-beige-100 text-sage-700',
  success: 'bg-sage-100 text-sage-700',
  muted: 'bg-beige-50 text-sage-600 border border-beige-200',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

/** Petite étiquette colorée. */
export function Badge({ tone = 'beige', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
