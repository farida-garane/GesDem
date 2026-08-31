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
  User,
  ShieldCheck,
  ChevronRight,
  Wrench,
  Users,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const isProfilRoute = pathname.startsWith('/profil');
  const isInterventionsRoute = pathname.startsWith('/interventions');
  const isNouvelleActive = pathname === '/demandes/nouvelle';
  const isProfilActive = pathname === '/profil';
  const isUtilisateursActive = pathname.startsWith('/utilisateurs');

  // Si on est sur la page Profil, on ne rend pas de sidebar (page pleine et libre)
  if (isProfilRoute) {
    return null;
  }

  // 1. Navigation INTERVENTIONS (File d'attente globale, Mes interventions, En attente)
  const currentVue = searchParams.get('vue') || 'all';
  const interventionNavItems = [
    {
      label: 'Toutes les demandes à traiter',
      description: "File d'attente globale",
      href: '/interventions',
      vue: 'all',
      icon: FolderOpen,
      dotColor: 'bg-slate-400',
    },
    {
      label: 'Mes interventions assignées',
      description: 'Ses tâches en cours',
      href: '/interventions?vue=mes_interventions',
      vue: 'mes_interventions',
      icon: UserCheck,
      dotColor: 'bg-blue-500',
    },
    {
      label: 'En attente de prise en charge',
      description: 'À traiter / Non assignées',
      href: '/interventions?vue=en_attente',
      vue: 'en_attente',
      icon: Clock,
      dotColor: 'bg-amber-500',
    },
  ];

  // 2. Navigation DEMANDES (Toutes mes demandes, En attente, En cours, Résolues)
  const currentStatut = searchParams.get('statut') || 'all';
  const demandeNavItems = [
    {
      label: 'Toutes mes demandes',
      href: '/demandes',
      statut: 'all',
      icon: ClipboardList,
      dotColor: 'bg-slate-400',
    },
    {
      label: 'En attente',
      href: '/demandes?statut=en_attente',
      statut: 'en_attente',
      icon: Clock,
      dotColor: 'bg-amber-500',
    },
    {
      label: 'En cours',
      href: '/demandes?statut=en_cours',
      statut: 'en_cours',
      icon: Zap,
      dotColor: 'bg-blue-500',
    },
    {
      label: 'Résolues',
      href: '/demandes?statut=resolue',
      statut: 'resolue',
      icon: CheckCircle2,
      dotColor: 'bg-emerald-500',
    },
  ];

  return (
    <aside className="w-full md:w-72 shrink-0 flex flex-col justify-between space-y-6">
      <div className="space-y-4">
        
        {/* ========================================================
            CAS A : PAGE INTERVENTIONS
            ======================================================== */}
        {isInterventionsRoute ? (
          <>
            <div className="px-3 pt-1 flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Espace Interventions
              </p>
              <span className="w-2 h-2 rounded-full bg-blue-500" title="Espace Technicien" />
            </div>

            <nav className="space-y-2">
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
                      'flex items-start gap-3 px-3.5 py-3 rounded-2xl text-xs sm:text-sm transition-all duration-200 border group',
                      isActive
                        ? 'bg-white text-slate-900 font-bold border-slate-200/80 shadow-xs ring-1 ring-slate-900/5'
                        : 'text-slate-600 hover:text-slate-900 font-medium bg-transparent hover:bg-white/70 border-transparent hover:border-slate-200/60'
                    )}
                  >
                    <span className={cn('w-2 h-2 rounded-full shrink-0 mt-1.5', item.dotColor)} />
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 mt-0.5 transition-colors',
                        isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-700'
                      )}
                    />
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate leading-tight font-semibold">{item.label}</span>
                      <span className="text-[10px] text-slate-400 font-normal truncate mt-0.5">
                        {item.description}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-2">
              <Link
                href="/demandes/nouvelle"
                className={cn(
                  'w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 border',
                  isNouvelleActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white/60 hover:bg-white text-slate-700 hover:text-slate-900 border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs'
                )}
              >
                <Plus className="w-3.5 h-3.5 text-slate-500" />
                <span>Créer une demande</span>
              </Link>
            </div>
          </>
        ) : (
          /* ========================================================
             CAS B : PAGE DEMANDES
             ======================================================== */
          <>
            <Link
              href="/demandes/nouvelle"
              className={cn(
                'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 shadow-sm',
                isNouvelleActive
                  ? 'bg-blue-700 text-white shadow-blue-600/30 ring-2 ring-blue-500/40'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20 active:scale-[0.98]'
              )}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nouvelle demande</span>
            </Link>

            <div className="px-3 pt-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Vues & Filtres
              </p>
            </div>

            <nav className="space-y-1.5">
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
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm transition-all duration-200 border',
                      isActive
                        ? 'bg-white text-slate-900 font-bold border-slate-200/80 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 font-medium bg-transparent hover:bg-white/70 border-transparent hover:border-slate-200/60'
                    )}
                  >
                    <span className={cn('w-2 h-2 rounded-full shrink-0', item.dotColor)} />
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-colors',
                        isActive ? 'text-slate-900' : 'text-slate-400'
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {(user?.role === 'technicien' || user?.role === 'admin') && (
              <div className="pt-3 border-t border-slate-200/60 space-y-1.5">
                <Link
                  href="/interventions"
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all border',
                    isInterventionsRoute
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'text-slate-700 hover:text-slate-900 bg-white/60 hover:bg-white border-slate-200/80 hover:border-slate-300'
                  )}
                >
                  <Wrench className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate">Espace Interventions</span>
                </Link>

                {user?.role === 'admin' && (
                  <Link
                    href="/utilisateurs"
                    className={cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all border',
                      isUtilisateursActive
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'text-slate-700 hover:text-slate-900 bg-white/60 hover:bg-white border-slate-200/80 hover:border-slate-300'
                    )}
                  >
                    <Users className="w-4 h-4 text-purple-600 shrink-0" />
                    <span className="truncate">Gestion Utilisateurs</span>
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ========================================================
          BAS : PROFIL UTILISATEUR GLOBALE
          ======================================================== */}
      <div className="pt-4 border-t border-slate-200/60">
        <Link
          href="/profil"
          className={cn(
            'p-3 rounded-2xl border transition-all duration-200 flex items-center justify-between group',
            isProfilActive
              ? 'bg-white border-blue-200 shadow-xs ring-2 ring-blue-500/20'
              : 'bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300 shadow-2xs hover:shadow-xs'
          )}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs transition-colors',
                isProfilActive ? 'bg-blue-600' : 'bg-slate-900 group-hover:bg-slate-800'
              )}
            >
              <User className="w-3.5 h-3.5 text-slate-200" />
            </div>
            <div className="overflow-hidden">
              <p
                className={cn(
                  'text-xs font-bold truncate transition-colors',
                  isProfilActive ? 'text-blue-600' : 'text-slate-900 group-hover:text-blue-600'
                )}
              >
                {user?.nom || user?.email || 'Mon Profil'}
              </p>
              <p className="text-[10px] text-slate-400 font-medium truncate flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500 inline shrink-0" />
                <span className="truncate capitalize">{user?.role || 'Demandeur'}</span>
              </p>
            </div>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>
      </div>
    </aside>
  );
}