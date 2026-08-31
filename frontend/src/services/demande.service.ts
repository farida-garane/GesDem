import { api } from './api';
import { Categorie, Statut, Demande, CreateDemandeInput, HistoriqueStatut, Commentaire } from '@/types/demande';

// Catégories professionnelles sans emojis
export const DEFAULT_CATEGORIES: Categorie[] = [
  { id: 1, libelle: 'Matériel (Ordinateur, écran, imprimante)' },
  { id: 2, libelle: 'Logiciel (Applications, système, messagerie)' },
  { id: 3, libelle: 'Réseau & Connexion (Wi-Fi, VPN, Internet)' },
  { id: 4, libelle: 'Assistance informatique (Accès, mot de passe)' },
  { id: 5, libelle: 'Logistique & Mobilier (Déplacement de poste)' },
  { id: 99, libelle: 'Autre (Problème non listé)' },
];

// Statuts officiels
export const DEFAULT_STATUTS: Statut[] = [
  { id: 1, libelle: 'En attente', ordre: 1, couleur: '#f59e0b' },
  { id: 2, libelle: 'Assignée', ordre: 2, couleur: '#6366f1' },
  { id: 3, libelle: 'En cours', ordre: 3, couleur: '#3b82f6' },
  { id: 4, libelle: 'Résolue', ordre: 4, couleur: '#10b981' },
  { id: 5, libelle: 'Clôturée', ordre: 5, couleur: '#64748b' },
];

export const demandeService = {
  async getCategories(): Promise<Categorie[]> {
    try {
      const data = await api.get<Categorie[]>('/api/demandes/categories/');
      if (data && data.length > 0) return data;
    } catch {
      // Fallback
    }
    return DEFAULT_CATEGORIES;
  },

  async getStatuts(): Promise<Statut[]> {
    try {
      const data = await api.get<Statut[]>('/api/demandes/statuts/');
      if (data && data.length > 0) return data;
    } catch {
      // Fallback
    }
    return DEFAULT_STATUTS;
  },

  async getDemandes(params?: Record<string, string | number | boolean | undefined | null>): Promise<Demande[]> {
    try {
      return await api.get<Demande[]>('/api/demandes/', params);
    } catch {
      return [];
    }
  },

  async getDemandeById(id: number | string): Promise<Demande | null> {
    try {
      return await api.get<Demande>(`/api/demandes/${id}/`);
    } catch {
      return null;
    }
  },

  async createDemande(data: CreateDemandeInput): Promise<Demande> {
    const formData = new FormData();
    formData.append('objet', data.objet);
    formData.append('description', data.description);
    formData.append('urgence', data.urgence);
    if (data.categorie) formData.append('categorie', String(data.categorie));
    if (data.piece_jointe) formData.append('piece_jointe', data.piece_jointe);

    return await api.post<Demande>('/api/demandes/', formData, true);
  },

  async updateDemandeStatut(id: number | string, data: { statut?: number; technicien?: number | null }): Promise<Demande> {
    return await api.patch<Demande>(`/api/demandes/${id}/`, data);
  },

  async getDemandeHistorique(demandeId: number | string): Promise<HistoriqueStatut[]> {
    try {
      return await api.get<HistoriqueStatut[]>(`/api/demandes/${demandeId}/historique/`);
    } catch {
      return [];
    }
  },

  async getCommentaires(demandeId?: number | string): Promise<Commentaire[]> {
    try {
      const all = await api.get<Commentaire[]>('/api/commentaires/');
      if (demandeId) {
        return all.filter((c) => String(c.demande) === String(demandeId));
      }
      return all;
    } catch {
      return [];
    }
  },

  async createCommentaire(demandeId: number, contenu: string): Promise<Commentaire> {
    return await api.post<Commentaire>('/api/commentaires/', {
      demande: demandeId,
      contenu,
    });
  },
};
