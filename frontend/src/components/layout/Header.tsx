'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LogOut,
  Layers,
  Bell,
  RotateCcw,
  User as UserIcon,
  LogIn
} from 'lucide-react';

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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/70 bg-white/80 backdrop-blur-xl shadow-2xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* 1. LOGO & IDENTITÉ DEMOPS */}
        <Link href={user ? '/demandes' : '/login'} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <Layers className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black text-slate-900 tracking-tight">
                DemOps
              </span>
              <span className="text-[10px] font-black uppercase px-1.5 py-0.5 bg-gradient-to-r from-blue-50 to-orange-50 text-blue-700 border border-blue-200/60 rounded-md">
                Cloud
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline-block">
              Support &amp; Interventions
            </span>
          </div>
        </Link>

        {/* 2. SECTION DROITE : ACTUALISER, NOTIFICATIONS & PROFIL */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* ========================================================
              BOUTON ACTUALISER DANS LA BARRE DE NAVIGATION
              ======================================================== */}
          <button
            onClick={handleRefresh}
            title="Actualiser la page"
            aria-label="Actualiser la page"
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-200/90 text-slate-700 hover:text-blue-600 hover:bg-slate-50 hover:border-blue-300 transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <RotateCcw className={`w-4 h-4 stroke-[2.2] ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {/* ========================================================
              ICÔNE DE NOTIFICATION SIMPLE & PROPRE
              ======================================================== */}
          <button
            title="Notifications"
            aria-label="Notifications"
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-200/90 text-slate-700 hover:text-blue-600 hover:bg-slate-50 hover:border-blue-300 transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <Bell className="w-4 h-4 stroke-[2.2]" />
          </button>

          {/* ========================================================
              BADGE PROFIL / ESPACE UTILISATEUR
              ======================================================== */}
          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:bg-slate-50 hover:border-blue-300 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-2xs">
                  {(user.nom || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors truncate max-w-[120px]">
                    {user.nom || user.email}
                  </p>
                  <p className="text-[10px] font-bold text-orange-600 capitalize">
                    {user.role || 'Demandeur'}
                  </p>
                </div>
              </button>

              {/* Dropdown Menu Profil */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-3xl bg-white border border-slate-200 shadow-2xl p-2 space-y-1 z-50 animate-fade-in">
                  <div className="p-3 border-b border-slate-100">
                    <p className="text-xs font-black text-slate-900 truncate">
                      {user.nom || user.email}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400 truncate">
                      {user.email}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200">
                      Rôle : {user.role || 'Demandeur'}
                    </span>
                  </div>

                  <Link
                    href="/profil"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-all"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span>Mon Profil</span>
                  </Link>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Se déconnecter</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
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
              className="w-10 h-10 hidden md:flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all border border-slate-200/90 hover:border-rose-200 bg-white cursor-pointer shadow-2xs"
            >
              <LogOut className="w-4 h-4 stroke-[2.2]" />
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
