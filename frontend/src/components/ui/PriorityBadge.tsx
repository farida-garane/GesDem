import React from 'react';
import { cn } from '@/lib/utils';

export type Urgence = 'faible' | 'moyen' | 'eleve';

interface PriorityBadgeProps {
  urgence: Urgence;
  className?: string;
}

export function PriorityBadge({ urgence, className }: PriorityBadgeProps) {
  const config: Record<Urgence, { label: string; style: string; dot: string }> = {
    eleve: {
      label: 'Élevée',
      style: 'bg-rose-50 text-rose-700 border-rose-200/80 ring-rose-500/20',
      dot: 'bg-rose-500',
    },
    moyen: {
      label: 'Moyenne',
      style: 'bg-amber-50 text-amber-700 border-amber-200/80 ring-amber-500/20',
      dot: 'bg-amber-500',
    },
    faible: {
      label: 'Faible',
      style: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-emerald-500/20',
      dot: 'bg-emerald-500',
    },
  };

  const item = config[urgence] || config.faible;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold border shadow-2xs',
        item.style,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', item.dot)} />
      {item.label}
    </span>
  );
}
