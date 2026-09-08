'use client';

import React from 'react';
import { DonutChart, DonutSegment } from './DonutChart';
import {
  FileSpreadsheet,
  Printer
} from 'lucide-react';

// Données statiques de maquette (Design uniquement - Non fonctionnel)
const STATIC_CATEGORIES: DonutSegment[] = [
  { id: 1, label: 'Matériel (Ordinateur, écran, imprimante)', value: 40, color: '#FF5E00' },
  { id: 2, label: 'Logiciel (Applications, messagerie, système)', value: 25, color: '#F59E0B' },
  { id: 3, label: 'Réseau & Connexion (Wi-Fi, VPN, Internet)', value: 20, color: '#0EA5E9' },
  { id: 4, label: 'Assistance informatique (Accès, mot de passe)', value: 10, color: '#002B7F' },
  { id: 5, label: 'Logistique & Mobilier (Déplacement de poste)', value: 5, color: '#EF4444' },
];

export function StatistiquesView() {
  return (
    <div className="w-full space-y-8 pb-16 animate-fade-in">
      
      {/* 1. EN-TÊTE & FILTRES (Maquette Visuelle) */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,43,127,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-black text-[#002B7F] tracking-tight">
              Statistiques &amp; Pilotage
            </h1>
            <span className="px-3.5 py-1 rounded-full text-xs font-black bg-[#E8F1FF] text-[#002B7F] border border-[#B3D1FF]">
              Maquette
            </span>
          </div>
          <p className="text-sm text-[#475569] font-semibold mt-1.5">
            Indicateurs de performance, répartition des charges et analyse des volumes.
          </p>
        </div>

        {/* Boutons d'Action & Filtre Période */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            defaultValue="mois"
            className="px-4 py-3 bg-slate-50 border border-slate-200 text-[#071530] font-bold rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-[#002B7F] cursor-pointer"
          >
            <option value="mois">Ce mois-ci</option>
            <option value="annee">Cette année</option>
            <option value="all">Historique complet</option>
          </select>

          <button
            type="button"
            className="px-4 py-3 rounded-2xl bg-white border border-slate-200 hover:border-[#002B7F] text-[#002B7F] text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            className="px-4 py-3 rounded-2xl bg-[#002B7F] hover:bg-[#001f5c] text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer</span>
          </button>
        </div>
      </div>

      {/* 2. CARTES KPI CHIFFRES CLÉS (Design Statique) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col gap-1">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#002B7F]">Total Demandes</span>
          <span className="text-4xl font-black text-[#002B7F] leading-none">--</span>
          <span className="text-xs font-semibold text-slate-400 mt-1">sur la période</span>
        </div>

        {/* En Attente */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col gap-1">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#002B7F]">En Attente</span>
          <span className="text-4xl font-black text-[#002B7F] leading-none">--</span>
          <span className="text-xs font-semibold text-slate-400 mt-1">non assignées</span>
        </div>

        {/* En Cours */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col gap-1">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#002B7F]">En Traitement</span>
          <span className="text-4xl font-black text-[#FF5E00] leading-none">--</span>
          <span className="text-xs font-semibold text-slate-400 mt-1">interventions actives</span>
        </div>

        {/* Taux de Résolution */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col gap-1">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#002B7F]">Taux Résolution</span>
          <span className="text-4xl font-black text-[#002B7F] leading-none">--%</span>
          <span className="text-xs font-semibold text-slate-400 mt-1">résolues</span>
        </div>
      </div>

      {/* 3. GRAPHIQUE EN ANNEAU : RÉPARTITION PAR CATÉGORIE (DONUT) */}
      <div className="p-6 sm:p-8 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_rgba(0,43,127,0.03)] space-y-6 max-w-3xl">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="text-sm font-black text-[#002B7F] uppercase tracking-wider">
            Répartition par Catégorie
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Ventilation des types d&apos;incidents signalés
          </p>
        </div>

        <DonutChart data={STATIC_CATEGORIES} totalLabel="Catégories" size={210} thickness={30} />
      </div>

    </div>
  );
}
