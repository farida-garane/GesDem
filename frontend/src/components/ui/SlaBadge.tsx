'use client';

import React from 'react';
import { Demande } from '@/types/demande';
import { calculateSla } from '@/utils/sla';

interface SlaBadgeProps {
  demande: Demande;
  className?: string;
}

export function SlaBadge({ }: SlaBadgeProps) {
  return null;
}
