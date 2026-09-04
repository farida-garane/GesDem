'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { demandeService } from '@/services/demande.service';
import { Demande } from '@/types/demande';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'urgent' | 'assigned' | 'resolved' | 'message';
  link?: string;
  demandeId?: number;
}

const STORAGE_KEY = 'gesdem_notifications_state';

export function useNotifications() {
  const { user } = useAuth();
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
      // 1. Récupérer les demandes récentes
      const demandes = await demandeService.getDemandes();
      
      // 2. Récupérer les identifiants déjà marqués comme lus dans localStorage
      const savedReadIds: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

      // 3. Générer les alertes intelligentes selon le rôle de l'utilisateur
      const generated: AppNotification[] = [];

      demandes.slice(0, 10).forEach((d: Demande) => {
        const ref = d.reference || `DEM-${d.id}`;
        const statut = d.statut_details?.libelle || '';

        if (user.role === 'demandeur') {
          // Alertes pour le demandeur
          if (statut.toLowerCase().includes('résol') || statut.toLowerCase().includes('clôtur')) {
            const notifId = `notif-resolved-${d.id}`;
            generated.push({
              id: notifId,
              title: `Demande résolue : ${ref}`,
              message: `Votre ticket « ${d.objet} » a été marqué comme résolu. Donnez votre avis !`,
              timestamp: d.date_modification || d.date_creation,
              read: savedReadIds.includes(notifId),
              type: 'resolved',
              link: `/demandes/${d.id}`,
              demandeId: d.id,
            });
          } else if (d.technicien) {
            const notifId = `notif-assigned-${d.id}-${d.technicien.id || d.technicien.email}`;
            generated.push({
              id: notifId,
              title: `Prise en charge : ${ref}`,
              message: `Les Services Généraux (${d.technicien.nom || d.technicien.email}) ont pris en charge votre demande.`,
              timestamp: d.date_modification || d.date_creation,
              read: savedReadIds.includes(notifId),
              type: 'assigned',
              link: `/demandes/${d.id}`,
              demandeId: d.id,
            });
          }
        } else if (user.role === 'technicien' || user.role === 'admin') {
          // Alertes pour les intervenants & admins
          if (d.urgence === 'eleve') {
            const notifId = `notif-urgent-${d.id}`;
            generated.push({
              id: notifId,
              title: `🚨 Ticket Urgent : ${ref}`,
              message: `Priorité haute : « ${d.objet} » par ${d.demandeur?.nom || 'Collaborateur'}.`,
              timestamp: d.date_creation,
              read: savedReadIds.includes(notifId),
              type: 'urgent',
              link: `/interventions/${d.id}`,
              demandeId: d.id,
            });
          } else if (!d.technicien) {
            const notifId = `notif-new-${d.id}`;
            generated.push({
              id: notifId,
              title: `Nouvelle demande : ${ref}`,
              message: `« ${d.objet} » est en attente de prise en charge.`,
              timestamp: d.date_creation,
              read: savedReadIds.includes(notifId),
              type: 'info',
              link: `/interventions/${d.id}`,
              demandeId: d.id,
            });
          }
        }

        // 4. Notifications pour les nouveaux messages reçus sur ce ticket
        if (d.commentaires && d.commentaires.length > 0) {
          d.commentaires.forEach((com) => {
            const isMyComment =
              (user.id && com.auteur === user.id) ||
              (user.email && com.auteur_details?.email === user.email) ||
              (user.nom && com.auteur_details?.nom === user.nom);

            if (!isMyComment) {
              const notifId = `notif-msg-${d.id}-${com.id}`;
              const senderName = com.auteur_details?.nom || com.auteur_details?.email || 'Intervenant';
              const ticketLink = user.role === 'demandeur' ? `/demandes/${d.id}` : `/interventions/${d.id}`;

              generated.push({
                id: notifId,
                title: `Message reçu : ${ref}`,
                message: `${senderName} : « ${com.contenu.length > 55 ? com.contenu.substring(0, 55) + '...' : com.contenu} »`,
                timestamp: com.date_creation,
                read: savedReadIds.includes(notifId),
                type: 'info',
                link: ticketLink,
                demandeId: d.id,
              });
            }
          });
        }
      });

      // Tri chronologique des notifications du plus récent au plus ancien
      generated.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Notification de bienvenue si aucune notification
      if (generated.length === 0) {
        const welcomeId = `welcome-${user.id || user.email}`;
        generated.push({
          id: welcomeId,
          title: 'Bienvenue sur DemOps',
          message: 'Toutes vos notifications et alertes système apparaîtront ici.',
          timestamp: new Date().toISOString(),
          read: savedReadIds.includes(welcomeId),
          type: 'info',
        });
      }

      setNotifications(generated);
    } catch {
      // Ignorer les erreurs silencieusement
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshNotifications();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(refreshNotifications, 30000);
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
