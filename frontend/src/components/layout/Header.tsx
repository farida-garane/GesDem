'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LogOut,
  Layers,
  RotateCcw,
  User as UserIcon,
  LogIn
} from 'lucide-react';
import { NotificationDropdown } from '@/components/layout/NotificationDropdown';

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Fermer le menu profil au clic à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* 1. LOGO & IDENTITÉ DEMOPS */}
        <Link href={user ? '/demandes' : '/login'} className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#002B7F] flex items-center justify-center text-white shadow-xs">
            <Layers className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black text-[#002B7F] tracking-tight group-hover:text-[#0047cc] transition-colors">
                Dem<span className="text-[#FF5E00]">Ops</span>
              </span>
            </div>
            <span className="text-[11px] text-[#475569] font-medium hidden sm:inline-block">
              Support &amp; Interventions
            </span>
          </div>
        </Link>

        {/* 2. SECTION DROITE : ACTUALISER, NOTIFICATIONS & PROFIL */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* BOUTON ACTUALISER DANS LA BARRE DE NAVIGATION */}
          <button
            onClick={handleRefresh}
            title="Actualiser la page"
            aria-label="Actualiser la page"
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50/80 hover:bg-[#E8F1FF] text-[#002B7F] border border-slate-100 hover:border-[#B3D1FF] transition-all cursor-pointer"
          >
            <RotateCcw className={`w-4 h-4 stroke-[2.5] ${isRefreshing ? 'animate-spin text-[#002B7F]' : ''}`} />
          </button>

          {/* MENU DE NOTIFICATIONS */}
          <NotificationDropdown />

          {/* BADGE PROFIL / ESPACE UTILISATEUR */}
          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-slate-50/80 hover:bg-[#E8F1FF] border border-slate-100 hover:border-[#B3D1FF] transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#002B7F] flex items-center justify-center text-white font-black text-xs shadow-xs">
                  {(user.nom || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-black text-[#071530] leading-tight group-hover:text-[#002B7F] transition-colors truncate max-w-[120px]">
                    {user.nom || user.email}
                  </p>
                  <p className="text-[10px] font-bold text-[#002B7F] capitalize">
                    {user.role || 'Demandeur'}
                  </p>
                </div>
              </button>

              {/* Dropdown Menu Profil */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-100 shadow-[0_10px_30px_rgba(0,43,127,0.08)] p-2 space-y-1 z-50 animate-fade-in">
                  <div className="p-3 border-b border-slate-100">
                    <p className="text-xs font-black text-[#071530] truncate">
                      {user.nom || user.email}
                    </p>
                    <p className="text-[10px] font-semibold text-[#475569] truncate">
                      {user.email}
                    </p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#E8F1FF] text-[#002B7F]">
                      Rôle : {user.role || 'Demandeur'}
                    </span>
                  </div>

                  <Link
                    href="/profil"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#071530] hover:text-[#002B7F] hover:bg-[#E8F1FF] transition-all"
                  >
                    <UserIcon className="w-4 h-4 text-[#002B7F]" />
                    <span>Mon Profil</span>
                  </Link>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Se déconnecter</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#FF5E00] hover:bg-[#E05200] text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <LogIn className="w-4 h-4 stroke-[2.5]" />
              <span>Connexion</span>
            </Link>
          )}

          {/* Bouton de Déconnexion rapide si connecté */}
          {user && (
            <button
              onClick={logout}
              title="Se déconnecter"
              className="w-10 h-10 hidden md:flex items-center justify-center text-[#475569] hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all border border-slate-100 bg-slate-50/80 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
