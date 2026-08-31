'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { demandeService } from '@/services/demande.service';
import { Demande, Categorie } from '@/types/demande';
import {
  Plus,
  Search,
  Loader2,
  Inbox,
  ArrowUpRight,
  RotateCcw,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

export function DemandeList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatut = searchParams.get('statut') || 'all';

  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtre de recherche
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [demandesData, categoriesData] = await Promise.all([
        demandeService.getDemandes(),
        demandeService.getCategories(),
      ]);
      setDemandes(demandesData);
      setCategories(categoriesData);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Métadonnées selon la vue active
  const viewMeta = useMemo(() => {
    switch (currentStatut) {
      case 'en_attente':
        return {
          title: 'Demandes en attente',
          desc: 'Tickets en attente de prise en charge par un technicien informatique.',
          badgeColor: 'bg-amber-100/80 text-amber-800 border-amber-200/80',
        };
      case 'en_cours':
        return {
          title: 'Interventions en cours',
          desc: 'Demandes actuellement en cours de traitement par le support technique.',
          badgeColor: 'bg-blue-100/80 text-blue-800 border-blue-200/80',
        };
      case 'resolue':
        return {
          title: 'Demandes résolues',
          desc: 'Historique de vos interventions résolues et clôturées.',
          badgeColor: 'bg-emerald-100/80 text-emerald-800 border-emerald-200/80',
        };
      default:
        return {
          title: 'Toutes mes demandes',
          desc: 'Suivez l\'état et l\'avancement de vos demandes d\'intervention.',
          badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  }, [currentStatut]);

  // Filtrage
  const filteredDemandes = useMemo(() => {
    return demandes.filter((item) => {
      // Filtre Statut piloté par la Sidebar
      if (currentStatut !== 'all') {
        const lib = item.statut_details?.libelle?.toLowerCase() || '';
        if (currentStatut === 'en_attente') {
          if (!lib.includes('attente') && item.statut !== 1) return false;
        } else if (currentStatut === 'en_cours') {
          if (!lib.includes('cours') && !lib.includes('assign') && item.statut !== 2 && item.statut !== 3) return false;
        } else if (currentStatut === 'resolue') {
          if (!lib.includes('resolu') && !lib.includes('cloture') && item.statut !== 4 && item.statut !== 5) return false;
        }
      }

      // Recherche
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const refMatch = (item.reference || `DEM-${item.id}`).toLowerCase().includes(q);
        const objMatch = item.objet.toLowerCase().includes(q);
        const descMatch = item.description.toLowerCase().includes(q);
        if (!refMatch && !objMatch && !descMatch) return false;
      }

      return true;
    });
  }, [demandes, currentStatut, searchQuery]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      
      {/* 1. EN-TÊTE MODERNE & ÉPURÉ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {viewMeta.title}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${viewMeta.badgeColor}`}>
              {filteredDemandes.length} ticket{filteredDemandes.length > 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {viewMeta.desc}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs text-xs font-semibold flex items-center gap-1.5"
            title="Actualiser la liste"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>

          <Link
            href="/demandes/nouvelle"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle demande</span>
          </Link>
        </div>
      </div>

      {/* 2. BARRE DE RECHERCHE RAPIDE */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Rechercher par référence (ex: DEM-001), objet ou description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 shadow-2xs transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded-md"
          >
            Effacer
          </button>
        )}
      </div>

      {/* 3. LISTE DES CARTES DEMANDES */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-slate-800 mx-auto" />
          <p className="text-xs text-slate-400 font-medium">Chargement de vos demandes...</p>
        </div>
      ) : filteredDemandes.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200/80 shadow-xs rounded-3xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Aucune demande trouvée</h3>
            <p className="text-xs text-slate-400 mt-1">
              {searchQuery
                ? 'Aucune demande ne correspond à votre recherche.'
                : 'Vous n\'avez actuellement aucune demande dans cette vue.'}
            </p>
          </div>
          <Link
            href="/demandes/nouvelle"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-black transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Déposer une demande</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDemandes.map((item) => {
            const statutCouleur = item.statut_details?.couleur || '#64748b';
            const statutLibelle = item.statut_details?.libelle || 'En attente';

            return (
              <Link
                key={item.id}
                href={`/demandes/${item.id}`}
                className="block p-4 sm:p-5 bg-white hover:bg-slate-50/80 border border-slate-200/90 rounded-2xl shadow-2xs hover:shadow-xs transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Gauche : Détails */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {item.reference || `DEM-${item.id}`}
                      </span>

                      <PriorityBadge urgence={item.urgence} />

                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold border"
                        style={{
                          backgroundColor: `${statutCouleur}15`,
                          color: statutCouleur,
                          borderColor: `${statutCouleur}40`,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: statutCouleur }}
                        />
                        {statutLibelle}
                      </span>

                      {item.categorie_details && (
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100/70 px-2 py-0.5 rounded-md">
                          {item.categorie_details.libelle}
                        </span>
                      )}
                    </div>

                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
                        {item.objet}
                      </h2>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 font-medium pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(item.date_creation)}
                      </span>
                    </div>
                  </div>

                  {/* Droite : Flèche d'accès */}
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors self-end sm:self-center">
                    <span>Consulter</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>

                </div>
              </Link>
            );
          })}
        </div>
      )}

    </div>
  );
}
