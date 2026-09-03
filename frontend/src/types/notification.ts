export type NotificationType = 
  | 'statut_change'
  | 'nouvelle_demande'
  | 'prise_en_charge'
  | 'resolution'
  | 'nouveau_commentaire'
  | 'avis_satisfaction'
  | 'alerte_admin';

export interface AppNotification {
  id: string;
  type: NotificationType;
  titre: string;
  message: string;
  lien?: string;
  demande_id?: number | string;
  destinataire_role?: 'demandeur' | 'technicien' | 'admin' | 'all';
  destinataire_id?: number;
  est_lu: boolean;
  date_creation: string;
}
