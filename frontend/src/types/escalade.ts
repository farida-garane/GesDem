import { UserSummary } from './demande';

export type StatutEscalade =
  | 'en_attente_devis'
  | 'en_cours_reparation'
  | 'en_attente_livraison'
  | 'repare_retourne'
  | 'annule';

export type TypeEchange = 'email' | 'appel' | 'devis' | 'expedition' | 'note';

export interface EchangeExterne {
  id: number;
  escalade: number;
  auteur: number;
  auteur_details?: UserSummary;
  type_echange: TypeEchange;
  sujet?: string;
  contenu: string;
  date_creation: string;
}

export interface EscaladeExterne {
  id: number;
  demande: number;
  nom_prestataire: string;
  contact_nom?: string;
  contact_email?: string;
  contact_telephone?: string;
  reference_externe?: string;
  motif: string;
  cout_estime?: number | string | null;
  statut: StatutEscalade;
  date_envoi?: string | null;
  date_retour_prevue?: string | null;
  date_retour_reelle?: string | null;
  cree_par?: number | null;
  cree_par_details?: UserSummary;
  echanges: EchangeExterne[];
  date_creation: string;
  date_modification: string;
}

export interface CreateEscaladeDto {
  demande: number;
  nom_prestataire: string;
  contact_nom?: string;
  contact_email?: string;
  contact_telephone?: string;
  reference_externe?: string;
  motif: string;
  cout_estime?: number | null;
  statut?: StatutEscalade;
  date_envoi?: string | null;
  date_retour_prevue?: string | null;
}

export interface CreateEchangeDto {
  escalade: number;
  type_echange: TypeEchange;
  sujet?: string;
  contenu: string;
}
