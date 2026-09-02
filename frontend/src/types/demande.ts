export interface Categorie {
  id: number;
  libelle: string;
  description?: string;
}

export interface Statut {
  id: number;
  libelle: string;
  ordre: number;
  couleur: string;
}

export type UrgenceLevel = 'faible' | 'moyen' | 'eleve';

export interface UserSummary {
  id: number;
  nom: string;
  email: string;
  role: 'demandeur' | 'technicien' | 'admin';
  departement?: string;
  telephone?: string;
}

export interface Demande {
  id: number;
  reference: string;
  objet: string;
  description: string;
  categorie: number | null;
  categorie_details?: Categorie;
  urgence: UrgenceLevel;
  statut: number | null;
  statut_details?: Statut;
  localisation?: string;
  piece_jointe?: string;
  demandeur: UserSummary;
  technicien?: UserSummary | null;
  date_creation: string;
  date_modification: string;
  date_cloture?: string | null;
  note_resolution?: string | null;
  note_satisfaction?: number | null;
  avis_satisfaction?: string | null;
}

export interface HistoriqueStatut {
  id: number;
  demande: number;
  ancien_statut: Statut | null;
  nouveau_statut: Statut | null;
  date_changement: string;
  modifie_par: UserSummary | null;
}

export interface Commentaire {
  id: number;
  demande: number;
  auteur: number;
  auteur_details?: UserSummary;
  contenu: string;
  date_creation: string;
}

export interface CreateDemandeInput {
  objet: string;
  categorie: number | string;
  urgence: UrgenceLevel;
  description: string;
  localisation?: string;
  piece_jointe?: File | null;
}
