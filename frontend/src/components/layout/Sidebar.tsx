'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  FolderOpen,
  UserCheck,
  Clock,
  ClipboardList,
  Zap,
  CheckCircle2,
  Plus,
  ChevronRight,
  Wrench,
  Users,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const isProfilRoute = pathname.startsWith('/profil');
  const isInterventionsRoute = pathname.startsWith('/interventions');
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/utilisateurs') || pathname.startsWith('/statistiques');
  const isNouvelleActive = pathname === '/demandes/nouvelle';
  const isProfilActive = pathname === '/profil';

  // Si on est sur la page Profil, on ne rend pas de sidebar (page pleine et libre)
  if (isProfilRoute) {
    return null;
  }

  // 1. Navigation ADMIN (Utilisateurs, Interventions, Demandes, Statistiques)
  const adminNavItems = [
    {
      label: 'Utilisateurs',
      href: '/utilisateurs',
      icon: Users,
      isActive: pathname.startsWith('/utilisateurs') || (pathname === '/admin' && (searchParams.get('tab') === 'utilisateurs' || !searchParams.get('tab'))),
    },
    {
      label: 'Interventions',
      href: '/interventions',
      icon: Wrench,
      isActive: pathname.startsWith('/interventions'),
    },
    {
      label: 'Demandes',
      href: '/demandes',
      icon: ClipboardList,
      isActive: pathname.startsWith('/demandes'),
    },
    {
      label: 'Statistiques',
      href: '/admin?tab=statistiques',
      icon: BarChart3,
      isActive: pathname === '/admin' && searchParams.get('tab') === 'statistiques',
    },
  ];

  // 2. Navigation INTERVENTIONS (File d'attente globale, Mes interventions, En attente)
  const currentVue = searchParams.get('vue') || 'all';
  const interventionNavItems = [
    {
      label: 'Toutes les demandes à traiter',
      description: "File d'attente globale",
      href: '/interventions',
      vue: 'all',
      icon: FolderOpen,
    },
    {
      label: 'Mes interventions assignées',
      description: 'Ses tâches en cours',
      href: '/interventions?vue=mes_interventions',
      vue: 'mes_interventions',
      icon: UserCheck,
    },
    {
      label: 'En attente de prise en charge',
      description: 'À traiter / Non assignées',
      href: '/interventions?vue=en_attente',
      vue: 'en_attente',
      icon: Clock,
    },
  ];

  // 3. Navigation DEMANDES (Toutes mes demandes, En attente, En cours, Résolues)
  const currentStatut = searchParams.get('statut') || 'all';
  const demandeNavItems = [
    {
      label: 'Toutes mes demandes',
      href: '/demandes',
      statut: 'all',
      icon: ClipboardList,
    },
    {
      label: 'En attente',
      href: '/demandes?statut=en_attente',
      statut: 'en_attente',
      icon: Clock,
    },
    {
      label: 'En cours',
      href: '/demandes?statut=en_cours',
      statut: 'en_cours',
      icon: Zap,
    },
    {
      label: 'Résolues',
      href: '/demandes?statut=resolue',
      statut: 'resolue',
      icon: CheckCircle2,
    },
  ];

  return (
    <aside className="w-full md:w-64 shrink-0 flex flex-col justify-between p-4 space-y-6 rounded-2xl border border-slate-300/70 bg-white/30 backdrop-blur-md shadow-xs hover:border-slate-400/60 transition-all duration-200">
      <div className="space-y-4">
        
        {/* ========================================================
            CAS 1 : MODE ADMIN (Utilisateurs, Interventions, Demandes, Statistiques)
            ======================================================== */}
        {user?.role === 'admin' || isAdminRoute ? (
          <>
            <div className="px-3 pt-1 flex items-center justify-between">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                Administration
              </p>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 border border-orange-200">
                Admin
              </span>
            </div>

            <nav className="space-y-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.isActive;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm transition-all duration-200 group',
                      isActive
                        ? 'astra-active-pill font-extrabold scale-[1.02]'
                        : 'text-slate-800 hover:text-slate-950 font-bold hover:bg-white/80 hover:shadow-2xs'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 stroke-[2.2]',
                        isActive ? 'text-blue-700' : 'text-slate-700 group-hover:text-slate-950'
                      )}
                    />
                    <span className="truncate font-bold text-slate-900">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </>
        ) : isInterventionsRoute ? (
          /* ========================================================
             CAS 2 : PAGE INTERVENTIONS (Technicien)
             ======================================================== */
          <>
            <div className="px-3 pt-1">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                Espace Interventions
              </p>
            </div>

            <nav className="space-y-1">
              {interventionNavItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === '/interventions' &&
                  (item.vue === 'all'
                    ? currentVue === 'all' || !searchParams.get('vue')
                    : currentVue === item.vue);

                return (
                  <Link
                    key={item.vue}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm transition-all duration-200 group',
                      isActive
                        ? 'astra-active-pill font-extrabold scale-[1.02]'
                        : 'text-slate-800 hover:text-slate-950 font-bold hover:bg-white/80 hover:shadow-2xs'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 stroke-[2.2]',
                        isActive ? 'text-blue-700' : 'text-slate-700 group-hover:text-slate-950'
                      )}
                    />
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate leading-tight font-bold text-slate-900">{item.label}</span>
                      <span className="text-[11px] text-slate-600 font-medium truncate mt-0.5">
                        {item.description}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </>
        ) : (
          /* ========================================================
             CAS 3 : PAGE DEMANDES (Demandeur)
             ======================================================== */
          <>
            <Link
              href="/demandes/nouvelle"
              className={cn(
                'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-200 shadow-md active:scale-[0.98]',
                isNouvelleActive
                  ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-500/20'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/25 hover:shadow-orange-500/35 hover:scale-[1.01]'
              )}
            >
              <Plus className="w-4 h-4 stroke-[2.8]" />
              <span>Nouvelle demande</span>
            </Link>

            <div className="px-3 pt-2">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                Vues & Filtres
              </p>
            </div>

            <nav className="space-y-1">
              {demandeNavItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === '/demandes' &&
                  (item.statut === 'all'
                    ? currentStatut === 'all' || !searchParams.get('statut')
                    : currentStatut === item.statut);

                return (
                  <Link
                    key={item.statut}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm transition-all duration-200 group',
                      isActive
                        ? 'astra-active-pill font-extrabold scale-[1.02]'
                        : 'text-slate-800 hover:text-slate-950 font-bold hover:bg-white/80 hover:shadow-2xs'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 stroke-[2.2]',
                        isActive ? 'text-blue-700' : 'text-slate-700 group-hover:text-slate-950'
                      )}
                    />
                    <span className="truncate font-bold text-slate-900">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {user?.role === 'technicien' && (
              <div className="pt-3 border-t border-slate-300/80 space-y-1">
                <Link
                  href="/interventions"
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all',
                    isInterventionsRoute
                      ? 'astra-active-pill font-extrabold'
                      : 'text-slate-800 hover:text-slate-950 hover:bg-white/80'
                  )}
                >
                  <Wrench className="w-4 h-4 text-blue-700 shrink-0 stroke-[2.2]" />
                  <span className="truncate font-bold text-slate-900">Espace Interventions</span>
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* ========================================================
          BAS : PROFIL UTILISATEUR
          ======================================================== */}
      <div className="pt-3 border-t border-slate-300/80">
        <Link
          href="/profil"
          className={cn(
            'p-2.5 rounded-2xl transition-all duration-200 flex items-center justify-between group bg-white/90 hover:bg-white border border-slate-300/80 shadow-2xs',
            isProfilActive ? 'ring-2 ring-blue-500/40' : ''
          )}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xs shrink-0 shadow-2xs">
              {(user?.nom || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-extrabold truncate text-slate-950 group-hover:text-blue-700 transition-colors">
                {user?.nom || user?.email || 'Mon Profil'}
              </p>
              <p className="text-[10px] text-orange-700 font-extrabold truncate capitalize">
                {user?.role || 'Demandeur'}
              </p>
            </div>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all shrink-0 stroke-[2.5]" />
        </Link>
      </div>
    </aside>
  );
}