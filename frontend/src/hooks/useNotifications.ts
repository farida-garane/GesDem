'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { demandeService } from '@/services/demande.service';
import { Demande } from '@/types/demande';
import { usePathname } from 'next/navigation';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'urgent' | 'assigned' | 'resolved' | 'message' | 'escalade';
  link?: string;
  demandeId?: number;
  badge?: string;
  badgeColor?: string;
}

const STORAGE_KEY = 'gesdem_notifications_state';
const PREV_SNAPSHOT_KEY = 'gesdem_demandes_snapshot';

// Fonction pour créer un snapshot de l'état des demandes
const createSnapshot = (demandes: Demande[]): string => {
  return JSON.stringify(demandes.map(d => ({
    id: d.id,
    statut: d.statut,
    technicien_id: d.technicien?.id,
    date_modification: d.date_modification,
    commentaire_count: d.commentaires?.length || 0,
  })));
};

// Fonction pour détecter les changements entre deux snapshots
const detectChanges = (oldSnapshot: string, newSnapshot: string): any[] => {
  if (!oldSnapshot) return [];
  
  const oldData = JSON.parse(oldSnapshot);
  const newData = JSON.parse(newSnapshot);
  
  const changes: any[] = [];
  
  newData.forEach((newItem: any) => {
    const oldItem = oldData.find((old: any) => old.id === newItem.id);
    
    if (!oldItem) {
      // Nouvelle demande
      changes.push({ type: 'new', demande: newItem });
    } else {
      // Changement de statut
      if (oldItem.statut !== newItem.statut) {
        changes.push({ type: 'statut_change', demande: newItem, oldStatut: oldItem.statut, newStatut: newItem.statut });
      }
      
      // Assignation d'un technicien
      if (!oldItem.technicien_id && newItem.technicien_id) {
        changes.push({ type: 'assigned', demande: newItem });
      }
      
      // Nouveau commentaire
      if (newItem.commentaire_count > oldItem.commentaire_count) {
        changes.push({ type: 'new_comment', demande: newItem });
      }
    }
  });
  
  return changes;
};

export function useNotifications() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger les notifications depuis le backend et localStorage
  const refreshNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }

    setLoading(true);
    try {
      // 1. Récupérer toutes les demandes récentes
      const demandes = await demandeService.getDemandes();
      
      // 2. Créer un snapshot actuel
      const currentSnapshot = createSnapshot(demandes);
      
      // 3. Récupérer le snapshot précédent
      const previousSnapshot = localStorage.getItem(PREV_SNAPSHOT_KEY);
      
      // 4. Détecter les changements
      const changes = detectChanges(previousSnapshot || '', currentSnapshot);
      
      // 5. Sauvegarder le nouveau snapshot
      localStorage.setItem(PREV_SNAPSHOT_KEY, currentSnapshot);
      
      // 6. Récupérer les identifiants déjà marqués comme lus
      const savedReadIds: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

      // 7. Générer les notifications basées sur les changements détectés
      const generated: AppNotification[] = [];

      // Filtrer les demandes pertinentes selon le rôle et la page
      const relevantDemandes = demandes.filter((d: Demande) => {
        // Demandeur : voit ses propres demandes
        if (user.role === 'demandeur') {
          return d.demandeur?.id === user.id;
        }
        // Technicien : voit les demandes non assignées ou les siennes
        if (user.role === 'technicien') {
          return !d.technicien || d.technicien.id === user.id;
        }
        // Admin : voit tout
        return true;
      });

      // Générer des notifications pour chaque changement détecté
      changes.forEach((change) => {
        const demande = demandes.find((d: Demande) => d.id === change.demande.id);
        if (!demande) return;

        const ref = demande.reference || `DEM-${demande.id}`;
        const statut = demande.statut_details?.libelle || 'En attente';
        const statutLower = statut.toLowerCase();
        const dateRef = demande.date_modification || demande.date_creation;

        // Générer les notifications selon le type de changement et le rôle
        if (change.type === 'new' && user.role !== 'demandeur') {
          // Nouvelle demande - seulement pour techniciens et admins
          const demandeurNom = demande.demandeur?.nom || demande.demandeur?.username || 'Collaborateur';
          const notifId = `notif-new-${demande.id}`;
          generated.push({
            id: notifId,
            title: `Nouvelle demande : ${ref}`,
            message: `« ${demande.objet} » par ${demandeurNom} nécessite une prise en charge.`,
            timestamp: dateRef,
            read: savedReadIds.includes(notifId),
            type: 'info',
            link: '/interventions',
            demandeId: demande.id,
            badge: 'Nouveau',
            badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
          });
        }

        if (change.type === 'statut_change') {
          // Changement de statut
          if (user.role === 'demandeur' && change.newStatut !== change.oldStatut) {
            const notifId = `notif-statut-${demande.id}-${change.newStatut}`;
            generated.push({
              id: notifId,
              title: `Statut mis à jour : ${ref}`,
              message: `Votre demande est maintenant : ${statut}`,
              timestamp: dateRef,
              read: savedReadIds.includes(notifId),
              type: 'info',
              link: `/demandes/${demande.id}`,
              demandeId: demande.id,
              badge: statut,
              badgeColor: statutLower.includes('résol') || statutLower.includes('clôtur') 
                ? 'bg-green-100 text-green-800 border-green-200'
                : 'bg-blue-100 text-blue-800 border-blue-200',
            });
          }
        }

        if (change.type === 'assigned' && user.role === 'demandeur') {
          // Assignation d'un technicien
          const techNom = demande.technicien?.nom || demande.technicien?.username || 'Intervenant';
          const notifId = `notif-assigned-${demande.id}`;
          generated.push({
            id: notifId,
            title: `Intervenant assigné : ${ref}`,
            message: `${techNom} a pris en charge votre demande.`,
            timestamp: dateRef,
            read: savedReadIds.includes(notifId),
            type: 'assigned',
            link: `/demandes/${demande.id}`,
            demandeId: demande.id,
            badge: 'Assignée',
            badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          });
        }

        if (change.type === 'new_comment') {
          // Nouveau commentaire
          const lastComment = demande.commentaires?.[demande.commentaires.length - 1];
          if (lastComment) {
            const isMyComment = lastComment.auteur === user.id || 
                             lastComment.auteur_details?.email === user.email;
            
            if (!isMyComment) {
              const senderName = lastComment.auteur_details?.nom || lastComment.auteur_details?.username || 'Intervenant';
              const notifId = `notif-comment-${demande.id}-${lastComment.id}`;
              const link = user.role === 'demandeur' ? `/demandes/${demande.id}` : `/interventions/${demande.id}`;
              
              generated.push({
                id: notifId,
                title: `Nouveau commentaire : ${ref}`,
                message: `${senderName} a ajouté un commentaire sur cette demande.`,
                timestamp: lastComment.date_creation,
                read: savedReadIds.includes(notifId),
                type: 'message',
                link: link,
                demandeId: demande.id,
                badge: 'Commentaire',
                badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
              });
            }
          }
        }
      });

      // Ajouter des notifications basées sur l'état actuel pour les demandes urgentes
      relevantDemandes.forEach((d: Demande) => {
        if (d.urgence === 'eleve' && user.role !== 'demandeur') {
          const notifId = `notif-urgent-${d.id}`;
          generated.push({
            id: notifId,
            title: `🚨 Demande urgente : ${d.reference || `DEM-${d.id}`}`,
            message: `Priorité haute : « ${d.objet} »`,
            timestamp: d.date_creation,
            read: savedReadIds.includes(notifId),
            type: 'urgent',
            link: '/interventions',
            demandeId: d.id,
            badge: 'Urgent',
            badgeColor: 'bg-red-100 text-red-800 border-red-200',
          });
        }
      });

      // Tri chronologique des notifications du plus récent au plus ancien
      generated.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Éviter les doublons stricts par ID
      const uniqueGenerated = generated.filter(
        (v, i, a) => a.findIndex((t) => t.id === v.id) === i
      );

      // Notification informative si aucune alerte
      if (uniqueGenerated.length === 0) {
        const welcomeId = `welcome-${user.id || user.email}`;
        uniqueGenerated.push({
          id: welcomeId,
          title: 'Système à jour',
          message: 'Aucun changement récent à signaler.',
          timestamp: new Date().toISOString(),
          read: savedReadIds.includes(welcomeId),
          type: 'info',
        });
      }

      setNotifications(uniqueGenerated);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshNotifications();
    // Rafraîchir toutes les 10 secondes pour détecter rapidement les changements
    const interval = setInterval(refreshNotifications, 10000);
    return () => clearInterval(interval);
  }, [refreshNotifications]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    const savedReadIds: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!savedReadIds.includes(id)) {
      savedReadIds.push(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedReadIds));
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    const allIds = notifications.map((n) => n.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allIds));
  };

  const clearAll = () => {
    const allIds = notifications.map((n) => n.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allIds));
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    loading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
}
