'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';


export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const isProfilRoute = pathname.startsWith('/profil');
  const isInterventionsRoute = pathname.startsWith('/interventions');
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/statistiques') || pathname.startsWith('/utilisateurs');
  const isProfilActive = pathname === '/profil';

  if (isProfilRoute) {
    return null;
  }

  // 1. Navigation ADMIN
  const adminNavItems = [
    {
      label: 'Utilisateurs',
      description: 'Gestion des comptes & rôles',
      href: '/admin',
    },
    {
      label: 'Demandes',
      description: 'Supervision des tickets',
      href: '/demandes',
    },
    {
      label: 'Interventions',
      description: 'Suivi des interventions',
      href: '/interventions',
    },
    {
      label: 'Statistiques',
      description: 'Indicateurs & métriques',
      disabled: true,
    },
    {
      label: 'Notifications',
      description: 'Alertes système & activité',
      href: '/profil',
    },
  ];

  // 2. Navigation INTERVENTIONS
  const currentVue = searchParams.get('vue') || 'dashboard';
  const interventionNavItems = [
    {
      label: 'Tableau de bord',
      description: 'Toutes les demandes & filtres',
      href: '/interventions?vue=dashboard',
      vue: 'dashboard',
    },
    {
      label: 'Traitement',
      description: 'Statuts, assignation & résolution',
      href: '/interventions?vue=traitement',
      vue: 'traitement',
    },
    {
      label: 'Mes interventions',
      description: 'Mes tickets assignés',
      href: '/interventions?vue=mes_interventions',
      vue: 'mes_interventions',
    },
  ];

  // 3. Navigation DEMANDES
  const currentStatut = searchParams.get('statut') || 'all';
  const demandeNavItems = [
    {
      label: 'Toutes mes demandes',
      href: '/demandes',
      statut: 'all',
    },
    {
      label: 'En attente',
      href: '/demandes?statut=en_attente',
      statut: 'en_attente',
    },
    {
      label: 'En cours',
      href: '/demandes?statut=en_cours',
      statut: 'en_cours',
    },
    {
      label: 'Résolues',
      href: '/demandes?statut=resolue',
      statut: 'resolue',
    },
  ];

  return (
    <aside className="w-full md:w-72 shrink-0 flex flex-col">
      <div className="bg-white rounded-3xl border border-slate-100/80 shadow-[0_4px_24px_rgba(0,43,127,0.03)] p-5 sm:p-6 flex flex-col justify-between min-h-[calc(100vh-8rem)]">
        
        {/* ========================================================
            PARTIE HAUTE : NAVIGATION
            ======================================================== */}
        <div className="space-y-6">
          {isAdminRoute ? (
            <>
              <div className="px-2 pt-1 flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-wider text-[#002B7F]">
                  Espace Administration
                </p>
                <span className="w-2.5 h-2.5 rounded-full bg-[#002B7F]" title="Espace Administrateur" />
              </div>

              <div className="space-y-2">
                {adminNavItems.map((item) => {
                  if (item.disabled || !item.href) {
                    return (
                      <div
                        key={item.label}
                        className="flex flex-col px-4 py-3 rounded-2xl text-xs sm:text-sm bg-[#F4F7FB] text-[#071530] select-none cursor-default"
                      >
                        <span className="truncate leading-tight font-black text-xs sm:text-sm text-[#071530]">
                          {item.label}
                        </span>
                        <span className="text-[11px] text-[#475569] font-medium truncate mt-0.5">
                          {item.description}
                        </span>
                      </div>
                    );
                  }

                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={cn(
                        'flex flex-col px-4 py-3 rounded-2xl text-xs sm:text-sm transition-all duration-200',
                        isActive
                          ? 'bg-[#E2ECFC] text-[#002B7F] font-black shadow-xs'
                          : 'bg-[#F4F7FB] text-[#1E293B] hover:bg-[#EBF2FC] hover:text-[#002B7F]'
                      )}
                    >
                      <span className="truncate leading-tight font-black text-xs sm:text-sm">{item.label}</span>
                      <span className="text-[11px] text-[#475569] font-medium truncate mt-0.5">
                        {item.description}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </>
          ) : isInterventionsRoute ? (
            /* ========================================================
               CAS B : PAGE INTERVENTIONS
               ======================================================== */
            <>
              <div className="px-2 pt-1 flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-wider text-[#002B7F]">
                  Espace Interventions
                </p>
                <span className="w-2.5 h-2.5 rounded-full bg-[#002B7F]" title="Espace Technicien" />
              </div>

              <div className="space-y-2">
                {interventionNavItems.map((item) => {
                  const isActive = currentVue === item.vue;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={cn(
                        'flex flex-col px-4 py-3 rounded-2xl text-xs sm:text-sm transition-all duration-200',
                        isActive
                          ? 'bg-[#E2ECFC] text-[#002B7F] font-black shadow-xs'
                          : 'bg-[#F4F7FB] text-[#1E293B] hover:bg-[#EBF2FC] hover:text-[#002B7F]'
                      )}
                    >
                      <span className="truncate leading-tight font-black text-xs sm:text-sm">{item.label}</span>
                      <span className="text-[11px] text-[#475569] font-medium truncate mt-0.5">
                        {item.description}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </>
          ) : (
            /* ========================================================
               CAS C : PAGE DEMANDES
               ======================================================== */
            <>
              <div className="px-2 pt-1 flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-wider text-[#002B7F]">
                  Espace Demandes
                </p>
                <span className="w-2.5 h-2.5 rounded-full bg-[#002B7F]" title="Espace Demandes" />
              </div>

              <div className="space-y-2">
                {demandeNavItems.map((item) => {
                  const isActive = currentStatut === item.statut;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={cn(
                        'flex items-center px-4 py-3 rounded-2xl text-xs sm:text-sm transition-all duration-200',
                        isActive
                          ? 'bg-[#E2ECFC] text-[#002B7F] font-black shadow-xs'
                          : 'bg-[#F4F7FB] text-[#1E293B] hover:bg-[#EBF2FC] hover:text-[#002B7F]'
                      )}
                    >
                      <span className="truncate font-black text-xs sm:text-sm">{item.label}</span>
                    </Link>
                  );
                })}

                {/* LIEN PERMANENT VERS LA FICHE D'ASSISTANCE */}
                <div className="pt-2 border-t border-slate-100">
                  <Link
                    href="/aide"
                    className={cn(
                      'flex items-center px-4 py-3 rounded-2xl text-xs sm:text-sm transition-all duration-200',
                      pathname === '/aide'
                        ? 'bg-[#E2ECFC] text-[#002B7F] font-black shadow-xs'
                        : 'bg-[#F4F7FB] text-[#1E293B] hover:bg-[#EBF2FC] hover:text-[#002B7F]'
                    )}
                  >
                    <span className="truncate font-black text-xs sm:text-sm">Fiche d&apos;Assistance</span>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ========================================================
            PARTIE BASSE : PROFIL UTILISATEUR INTÉGRÉ AU BAS DE LA BARRE
            ======================================================== */}
        <div className="pt-6 mt-6 border-t border-slate-100">
          <Link
            href="/profil"
            className={cn(
              'p-3.5 rounded-2xl transition-all duration-200 flex items-center justify-between group',
              isProfilActive
                ? 'bg-[#E2ECFC]'
                : 'bg-[#F4F7FB] hover:bg-[#EBF2FC]'
            )}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0 bg-[#002B7F] shadow-xs">
                {(user?.nom || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p
                  className={cn(
                    'text-xs font-black truncate transition-colors',
                    isProfilActive ? 'text-[#002B7F]' : 'text-[#071530] group-hover:text-[#002B7F]'
                  )}
                >
                  {user?.nom || user?.email || 'Mon Profil'}
                </p>
                <p className="text-[10px] text-[#475569] font-semibold truncate">
                  <span className="truncate capitalize">{user?.role || 'Demandeur'}</span>
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-[#002B7F] group-hover:translate-x-0.5 transition-all shrink-0">&rarr;</span>
          </Link>
        </div>

      </div>
    </aside>
  );
}
