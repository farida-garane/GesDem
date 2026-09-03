'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/services/notification.service';
import { AppNotification } from '@/types/notification';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Star,
  Wrench,
  FileText,
  Clock,
  CheckCheck,
  Trash2,
  ExternalLink,
  Inbox
} from 'lucide-react';

export function NotificationDropdown() {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    const list = notificationService.getNotifications(user.role, user.id);
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifications();

    const handleUpdate = () => loadNotifications();
    window.addEventListener('notifications_updated', handleUpdate);
    return () => window.removeEventListener('notifications_updated', handleUpdate);
  }, [user]);

  // Fermeture clic extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.est_lu).length;

  const filteredList = filter === 'unread' 
    ? notifications.filter((n) => !n.est_lu) 
    : notifications;

  const handleMarkAllAsRead = () => {
    if (!user) return;
    notificationService.markAllAsRead(user.role, user.id);
    loadNotifications();
  };

  const handleClickItem = (notif: AppNotification) => {
    if (!notif.est_lu) {
      notificationService.markAsRead(notif.id);
      loadNotifications();
    }
    setIsOpen(false);
    if (notif.lien) {
      router.push(notif.lien);
    }
  };

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    notificationService.deleteNotification(id);
    loadNotifications();
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'prise_en_charge':
        return <Wrench className="w-4 h-4 text-orange-600" />;
      case 'resolution':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'avis_satisfaction':
        return <Star className="w-4 h-4 text-amber-500 fill-amber-500" />;
      case 'nouveau_commentaire':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'alerte_admin':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      default:
        return <FileText className="w-4 h-4 text-blue-600" />;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const now = new Date();
      const date = new Date(dateStr);
      const diffMin = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      if (diffMin < 1) return 'À l’instant';
      if (diffMin < 60) return `Il y a ${diffMin} min`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `Il y a ${diffHours} h`;
      const diffDays = Math.floor(diffHours / 24);
      return `Il y a ${diffDays} j`;
    } catch {
      return '';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* BOUTON CLOCHE AVEC BADGE RÉEL */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
        aria-label="Notifications"
        className={`w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-200/90 text-slate-700 hover:text-blue-600 hover:bg-slate-50 hover:border-blue-300 transition-all shadow-2xs cursor-pointer active:scale-95 relative ${
          isOpen ? 'border-blue-500 ring-2 ring-blue-500/20 text-blue-600' : ''
        }`}
      >
        <Bell className="w-4 h-4 stroke-[2.2]" />
        
        {/* Pastille / Badge uniquement s'il y a des notifications non lues */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-orange-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs animate-pulse border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* MENU DÉROULANT DES NOTIFICATIONS */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white border border-slate-200/90 rounded-3xl shadow-2xl p-4 space-y-3 z-50 animate-fade-in">
          
          {/* En-tête */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-orange-100 text-orange-800">
                  {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Tout marquer comme lu</span>
              </button>
            )}
          </div>

          {/* Onglets Filtres (Toutes / Non lues) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-1 rounded-lg text-center transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Toutes ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`flex-1 py-1 rounded-lg text-center transition-all cursor-pointer ${
                filter === 'unread'
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Non lues ({unreadCount})
            </button>
          </div>

          {/* Liste des Notifications */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {filteredList.length === 0 ? (
              <div className="py-8 text-center space-y-2 text-slate-400">
                <Inbox className="w-8 h-8 mx-auto stroke-[1.5] text-slate-300" />
                <p className="text-xs font-semibold">
                  {filter === 'unread' ? 'Aucune notification non lue.' : 'Aucune notification pour le moment.'}
                </p>
              </div>
            ) : (
              filteredList.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleClickItem(notif)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 group relative ${
                    notif.est_lu
                      ? 'bg-white border-slate-100 hover:bg-slate-50/80 text-slate-700'
                      : 'bg-blue-50/50 border-blue-200/70 hover:bg-blue-50/80 text-slate-900 font-medium shadow-2xs'
                  }`}
                >
                  {/* Icône selon type */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                    notif.est_lu ? 'bg-slate-100 border-slate-200' : 'bg-white border-blue-200 shadow-2xs'
                  }`}>
                    {getIcon(notif.type)}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 space-y-0.5 overflow-hidden">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-extrabold truncate ${notif.est_lu ? 'text-slate-800' : 'text-blue-950'}`}>
                        {notif.titre}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {formatTimeAgo(notif.date_creation)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>

                  {/* Bouton Supprimer au survol */}
                  <button
                    onClick={(e) => handleDeleteItem(e, notif.id)}
                    title="Supprimer"
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Point bleu non lu */}
                  {!notif.est_lu && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 self-center" />
                  )}
                </div>
              ))
            )}
          </div>

        </div>
      )}

    </div>
  );
}
