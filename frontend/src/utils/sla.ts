import { Demande, UrgenceLevel } from '@/types/demande';

export interface SlaInfo {
  status: 'on_time' | 'warning' | 'late' | 'resolved_on_time' | 'resolved_late';
  label: string;
  detail: string;
  isLate: boolean;
  hoursElapsed: number;
  maxHours: number;
}

// Délais maximaux de prise en charge (en heures)
export const SLA_PRISE_EN_CHARGE: Record<UrgenceLevel, number> = {
  eleve: 2,    // 2 heures
  moyen: 12,   // 12 heures
  faible: 24,  // 24 heures
};

// Délais maximaux de résolution totale (en heures)
export const SLA_RESOLUTION: Record<UrgenceLevel, number> = {
  eleve: 8,    // 8 heures
  moyen: 24,   // 24 heures
  faible: 48,  // 48 heures
};

export function calculateSla(demande: Demande): SlaInfo {
  const urgence: UrgenceLevel = (demande.urgence as UrgenceLevel) || 'faible';
  const createdTime = new Date(demande.date_creation).getTime();
  const now = Date.now();

  const statutLibelle = (demande.statut_details?.libelle || '').toLowerCase();
  const isResolved =
    statutLibelle.includes('resolu') ||
    statutLibelle.includes('cloture') ||
    demande.statut === 4 ||
    demande.statut === 5;

  // 1. CAS D'UN DOSSIER RÉSOLU OU CLÔTURÉ
  if (isResolved) {
    const closedTime = demande.date_cloture
      ? new Date(demande.date_cloture).getTime()
      : demande.date_modification
      ? new Date(demande.date_modification).getTime()
      : now;

    const totalHours = Math.max(0, (closedTime - createdTime) / (1000 * 60 * 60));
    const maxAllowedHours = SLA_RESOLUTION[urgence];

    if (totalHours <= maxAllowedHours) {
      return {
        status: 'resolved_on_time',
        label: 'Traité dans les délais',
        detail: `Résolu en ${formatHoursMinutes(totalHours)} (SLA : ${maxAllowedHours}h)`,
        isLate: false,
        hoursElapsed: totalHours,
        maxHours: maxAllowedHours,
      };
    } else {
      const retard = totalHours - maxAllowedHours;
      return {
        status: 'resolved_late',
        label: 'Traité hors délai',
        detail: `Délai dépassé de ${formatHoursMinutes(retard)} (durée : ${formatHoursMinutes(totalHours)})`,
        isLate: true,
        hoursElapsed: totalHours,
        maxHours: maxAllowedHours,
      };
    }
  }

  // 2. CAS D'UN DOSSIER EN COURS / EN ATTENTE
  const hasTechnicien = !!demande.technicien;
  const maxAllowedHours = hasTechnicien ? SLA_RESOLUTION[urgence] : SLA_PRISE_EN_CHARGE[urgence];
  const elapsedHours = Math.max(0, (now - createdTime) / (1000 * 60 * 60));
  const remainingHours = maxAllowedHours - elapsedHours;

  const typeLabel = hasTechnicien ? 'Résolution' : 'Prise en charge';

  if (remainingHours < 0) {
    const retard = Math.abs(remainingHours);
    return {
      status: 'late',
      label: `En retard (${formatHoursMinutes(retard)})`,
      detail: `SLA ${typeLabel} (${maxAllowedHours}h) dépassé depuis ${formatHoursMinutes(retard)}`,
      isLate: true,
      hoursElapsed: elapsedHours,
      maxHours: maxAllowedHours,
    };
  } else if (remainingHours <= 1 || (maxAllowedHours > 4 && remainingHours <= 3)) {
    return {
      status: 'warning',
      label: `Reste ${formatHoursMinutes(remainingHours)}`,
      detail: `Échéance ${typeLabel} dans ${formatHoursMinutes(remainingHours)} (SLA ${maxAllowedHours}h)`,
      isLate: false,
      hoursElapsed: elapsedHours,
      maxHours: maxAllowedHours,
    };
  } else {
    return {
      status: 'on_time',
      label: `Délai : ${formatHoursMinutes(remainingHours)}`,
      detail: `Dans les temps. Échéance ${typeLabel} dans ${formatHoursMinutes(remainingHours)} (SLA ${maxAllowedHours}h)`,
      isLate: false,
      hoursElapsed: elapsedHours,
      maxHours: maxAllowedHours,
    };
  }
}

function formatHoursMinutes(decimalHours: number): string {
  const totalMinutes = Math.round(decimalHours * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}min`;
}
