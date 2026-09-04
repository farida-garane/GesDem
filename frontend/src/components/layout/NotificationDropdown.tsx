import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();

  // Déterminer le lien et le texte contextuel selon le rôle et la page actuelle
  const getFooterLink = () => {
    if (pathname.startsWith('/admin') || user?.role === 'admin') {
      return { href: '/admin', label: "Accéder à l'administration" };
    }
    if (pathname.startsWith('/interventions') || user?.role === 'technicien') {
      return { href: '/interventions', label: "Voir le suivi des interventions" };
    }
    return { href: '/demandes', label: "Voir toutes mes demandes" };
  };

  const footerLink = getFooterLink();

  // Fermer le dropdown en cliquant à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatRelativeTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffMinutes < 1) return "À l'instant";
      if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `Il y a ${diffHours} h`;
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    } catch {
      return 'Récemment';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton Cloche */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className={cn(
          'relative w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border',
          isOpen
            ? 'bg-[#E8F1FF] border-[#B3D1FF] text-[#002B7F]'
            : 'bg-slate-50/80 border-slate-100 text-[#475569] hover:text-[#002B7F] hover:bg-[#E8F1FF] hover:border-[#B3D1FF]'
        )}
      >
        <Bell className="w-4 h-4" />
        
        {/* Badge de notifications non lues */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#FF5E00] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Menu Déroulant des Notifications */}
      {isOpen && (
        <div className="absolute right-0 sm:right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white border border-slate-100/90 shadow-[0_10px_40px_rgba(0,43,127,0.08)] z-50 overflow-hidden animate-in fade-in zoom-in-95">
          
          {/* En-tête du menu */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-[#071530] uppercase tracking-wider">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#E8F1FF] text-[#002B7F]">
                  {unreadCount}
                </span>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-bold text-[#002B7F] hover:underline cursor-pointer"
                  >
                    Tout lire
                  </button>
                )}
                <button
                  onClick={clearAll}
                  className="text-[11px] font-bold text-[#64748B] hover:text-rose-600 cursor-pointer transition-colors"
                >
                  Effacer
                </button>
              </div>
            )}
          </div>

          {/* Corps de la liste */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-50 p-2 space-y-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <p className="text-xs font-bold text-[#071530]">Aucune notification</p>
                <p className="text-[11px] text-[#64748B]">Vous êtes à jour dans vos alertes.</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const ItemWrapper = notif.link ? Link : 'div';
                
                return (
                  <ItemWrapper
                    key={notif.id}
                    href={notif.link || '#'}
                    onClick={() => {
                      markAsRead(notif.id);
                      if (notif.link) setIsOpen(false);
                    }}
                    className={cn(
                      'p-3.5 rounded-2xl transition-colors cursor-pointer group block text-left',
                      notif.read
                        ? 'hover:bg-slate-50/80 opacity-75'
                        : 'bg-[#F4F7FB]/80 hover:bg-[#E8F1FF]/60 border border-slate-100/60'
                    )}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn(
                          'text-xs truncate transition-colors',
                          notif.read ? 'font-bold text-[#1E293B]' : 'font-black text-[#071530] group-hover:text-[#002B7F]'
                        )}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-[#FF5E00] shrink-0" />
                        )}
                      </div>
                      
                      <p className="text-xs text-[#475569] font-medium line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="pt-1 text-[11px] text-[#64748B] font-semibold">
                        <span>{formatRelativeTime(notif.timestamp)}</span>
                      </div>
                    </div>
                  </ItemWrapper>
                );
              })
            )}
          </div>

          {/* Pied de page dynamique et contextuel */}
          <div className="p-3 bg-slate-50/60 border-t border-slate-100 text-center">
            <Link
              href={footerLink.href}
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-[#002B7F] hover:underline inline-block"
            >
              <span>{footerLink.label} &rarr;</span>
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}
