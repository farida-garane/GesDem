'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Layers } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo & Marque DemOps */}
        <Link href="/demandes" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center text-white shadow-sm shadow-slate-900/20 group-hover:scale-105 transition-transform duration-200">
            <Layers className="w-5 h-5 text-indigo-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              DemOps
            </span>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline-block">
              Portail des demandes & interventions
            </span>
          </div>
        </Link>

        {/* Profil & Déconnexion à droite */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-100">
              <Link
                href="/profil"
                className="text-right hidden sm:block hover:opacity-80 transition-opacity cursor-pointer"
                title="Accéder à mon profil"
              >
                <p className="text-xs font-semibold text-slate-900">{user.nom || user.email}</p>
                <p className="text-[10px] font-medium text-slate-400 capitalize">{user.role || 'Demandeur'}</p>
              </Link>

              <button
                onClick={logout}
                title="Se déconnecter"
                className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
