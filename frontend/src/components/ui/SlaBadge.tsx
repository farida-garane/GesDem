'use client';

import React from 'react';
import { Demande } from '@/types/demande';
import { calculateSla } from '@/utils/sla';

interface SlaBadgeProps {
  demande: Demande;
  className?: string;
}

export function SlaBadge({ demande, className = '' }: SlaBadgeProps) {
  const sla = calculateSla(demande);

  let badgeStyle = '';
  switch (sla.status) {
    case 'late':
      badgeStyle = 'bg-rose-100 text-rose-950 border-rose-300 font-black shadow-xs';
      break;
    case 'warning':
      badgeStyle = 'bg-amber-100 text-amber-950 border-amber-300 font-black shadow-xs';
      break;
    case 'resolved_on_time':
      badgeStyle = 'bg-emerald-100 text-emerald-950 border-emerald-300 font-black shadow-xs';
      break;
    case 'resolved_late':
      badgeStyle = 'bg-slate-200 text-slate-800 border-slate-300 font-bold';
      break;
    case 'on_time':
    default:
      badgeStyle = 'bg-[#E8F1FF] text-[#002B7F] border-[#80B3FF] font-black shadow-xs';
      break;
  }

  return (
    <span
      title={sla.detail}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs border ${badgeStyle} ${className}`}
    >
      <span>{sla.label}</span>
    </span>
  );
}
