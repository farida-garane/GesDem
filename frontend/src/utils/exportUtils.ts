import { Demande } from '@/types/demande';
import { calculateSla } from '@/utils/sla';

/**
 * Exporte une liste de demandes au format CSV (compatible Excel avec encodage UTF-8 BOM).
 */
export function exportDemandesToCsv(demandes: Demande[], filenamePrefix: string = 'demandes_export'): void {
  if (!demandes || demandes.length === 0) {
    alert('Aucune donnée à exporter.');
    return;
  }

  const headers = [
    'Référence',
    'Date de création',
    'Demandeur',
    'Email Demandeur',
    'Département',
    'Catégorie',
    'Objet',
    'Description',
    'Urgence',
    'Statut',
    'Intervenant assigné',
    'Délai / Statut SLA',
    'Date de clôture',
    'Note satisfaction',
  ];

  const escapeCsv = (val: unknown): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = demandes.map((d) => {
    const sla = calculateSla(d);
    const demandeurNom = d.demandeur?.nom || d.demandeur?.email || '';
    const demandeurEmail = d.demandeur?.email || '';
    const departement = d.demandeur?.departement || '';
    const categorie = d.categorie_details?.libelle || '';
    const statut = d.statut_details?.libelle || 'En attente';
    const technicien = d.technicien ? (d.technicien.nom || d.technicien.email || '') : 'Non assigné';
    const note = d.note_satisfaction ? `${d.note_satisfaction}/5` : '';

    return [
      escapeCsv(d.reference || `DEM-${d.id}`),
      escapeCsv(formatCsvDate(d.date_creation)),
      escapeCsv(demandeurNom),
      escapeCsv(demandeurEmail),
      escapeCsv(departement),
      escapeCsv(categorie),
      escapeCsv(d.objet),
      escapeCsv(d.description),
      escapeCsv(d.urgence.toUpperCase()),
      escapeCsv(statut),
      escapeCsv(technicien),
      escapeCsv(sla.label),
      escapeCsv(d.date_cloture ? formatCsvDate(d.date_cloture) : ''),
      escapeCsv(note),
    ].join(';');
  });

  // UTF-8 BOM pour ouverture automatique sans bug d'accents dans Excel
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function formatCsvDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}
