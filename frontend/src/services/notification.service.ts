import { AppNotification, NotificationType } from '@/types/notification';
import { UserRole } from '@/types/user';

const STORAGE_KEY = 'gesdem_notifications_v1';

class NotificationService {
  private getStored(): AppNotification[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        const initial = this.getSeedNotifications();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private setStored(notifs: AppNotification[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
      window.dispatchEvent(new Event('notifications_updated'));
    } catch {
      // Ignorer
    }
  }

  private getSeedNotifications(): AppNotification[] {
    const now = new Date();
    return [
      // Pour Demandeur
      {
        id: 'notif-1',
        type: 'prise_en_charge',
        titre: 'Demande prise en charge',
        message: 'Votre demande #DEM-0001 a été prise en charge par le service RH.',
        lien: '/demandes/1',
        demande_id: 1,
        destinataire_role: 'demandeur',
        est_lu: false,
        date_creation: new Date(now.getTime() - 1000 * 60 * 25).toISOString(), // 25 min ago
      },
      {
        id: 'notif-2',
        type: 'resolution',
        titre: 'Demande résolue',
        message: 'Le matériel a été commandé. N’hésitez pas à évaluer la prise en charge.',
        lien: '/demandes/2',
        demande_id: 2,
        destinataire_role: 'demandeur',
        est_lu: false,
        date_creation: new Date(now.getTime() - 1000 * 60 * 120).toISOString(), // 2h ago
      },
      // Pour Intervenant (Technicien)
      {
        id: 'notif-3',
        type: 'nouvelle_demande',
        titre: 'Nouvelle demande urgente',
        message: 'Une demande prioritaire "Panne réseau au siège" est en attente de prise en charge.',
        lien: '/interventions/1',
        demande_id: 1,
        destinataire_role: 'technicien',
        est_lu: false,
        date_creation: new Date(now.getTime() - 1000 * 60 * 15).toISOString(), // 15 min ago
      },
      {
        id: 'notif-4',
        type: 'avis_satisfaction',
        titre: 'Nouvel avis collaborateur',
        message: 'Un collaborateur a noté votre traitement ★★★★★ avec commentaire positif.',
        lien: '/interventions/2',
        demande_id: 2,
        destinataire_role: 'technicien',
        est_lu: false,
        date_creation: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
      },
      // Pour Admin
      {
        id: 'notif-5',
        type: 'alerte_admin',
        titre: 'Alerte Direction',
        message: 'Rapport mensuel des interventions consolidé avec un taux de satisfaction de 92%.',
        lien: '/admin',
        destinataire_role: 'admin',
        est_lu: false,
        date_creation: new Date(now.getTime() - 1000 * 60 * 45).toISOString(),
      },
    ];
  }

  public getNotifications(role?: UserRole, userId?: number): AppNotification[] {
    const list = this.getStored();
    if (!role) return list;

    return list.filter((n) => {
      if (n.destinataire_role === 'all') return true;
      if (n.destinataire_id && userId && n.destinataire_id === userId) return true;
      if (n.destinataire_role === role) return true;
      return false;
    }).sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime());
  }

  public getUnreadCount(role?: UserRole, userId?: number): number {
    return this.getNotifications(role, userId).filter((n) => !n.est_lu).length;
  }

  public addNotification(
    notif: Omit<AppNotification, 'id' | 'date_creation' | 'est_lu'>
  ): AppNotification {
    const list = this.getStored();
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      date_creation: new Date().toISOString(),
      est_lu: false,
    };
    this.setStored([newNotif, ...list]);
    return newNotif;
  }

  public markAsRead(id: string): void {
    const list = this.getStored();
    const updated = list.map((n) => (n.id === id ? { ...n, est_lu: true } : n));
    this.setStored(updated);
  }

  public markAllAsRead(role?: UserRole, userId?: number): void {
    const list = this.getStored();
    const updated = list.map((n) => {
      const matchRole = !role || n.destinataire_role === 'all' || n.destinataire_role === role;
      const matchUser = !n.destinataire_id || (userId && n.destinataire_id === userId);
      if (matchRole && matchUser) {
        return { ...n, est_lu: true };
      }
      return n;
    });
    this.setStored(updated);
  }

  public deleteNotification(id: string): void {
    const list = this.getStored();
    const updated = list.filter((n) => n.id !== id);
    this.setStored(updated);
  }
}

export const notificationService = new NotificationService();
