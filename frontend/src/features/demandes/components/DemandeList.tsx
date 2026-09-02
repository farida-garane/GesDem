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

  // Filtres avancés & Tri
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState<string>('all');
  const [selectedUrgence, setSelectedUrgence] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'ancien' | 'urgence'>('recent');

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
        };
      case 'en_cours':
        return {
          title: 'Interventions en cours',
          desc: 'Demandes actuellement en cours de traitement par le support technique.',
        };
      case 'resolue':
        return {
          title: 'Demandes résolues',
          desc: 'Historique de vos interventions résolues et clôturées.',
        };
      default:
        return {
          title: 'Toutes mes demandes',
          desc: 'Suivez l\'état et l\'avancement de vos demandes d\'intervention.',
        };
    }
  }, [currentStatut]);

  // Filtrage & Tri
  const filteredDemandes = useMemo(() => {
    const list = demandes.filter((item) => {
      // 1. Filtre Statut piloté par la Sidebar
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

      // 2. Filtre Catégorie
      if (selectedCategorie !== 'all') {
        if (String(item.categorie) !== selectedCategorie) return false;
      }

      // 3. Filtre Urgence
      if (selectedUrgence !== 'all') {
        if (item.urgence !== selectedUrgence) return false;
      }

      // 4. Recherche
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const refMatch = (item.reference || `DEM-${item.id}`).toLowerCase().includes(q);
        const objMatch = item.objet.toLowerCase().includes(q);
        const descMatch = item.description.toLowerCase().includes(q);
        if (!refMatch && !objMatch && !descMatch) return false;
      }

      return true;
    });

    // Tri
    return list.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime();
      }
      if (sortBy === 'ancien') {
        return new Date(a.date_creation).getTime() - new Date(b.date_creation).getTime();
      }
      if (sortBy === 'urgence') {
        const weight: Record<string, number> = { eleve: 3, moyen: 2, faible: 1 };
        return (weight[b.urgence] || 0) - (weight[a.urgence] || 0);
      }
      return 0;
    });
  }, [demandes, currentStatut, selectedCategorie, selectedUrgence, searchQuery, sortBy]);

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
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-fade-in">
      
      {/* 1. EN-TÊTE MODERNE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {viewMeta.title}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
              {filteredDemandes.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {viewMeta.desc}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            href="/demandes/nouvelle"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold transition-all duration-200 shadow-md shadow-orange-500/20 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle demande</span>
          </Link>
        </div>
      </div>

      {/* 2. BARRE DE RECHERCHE & FILTRES CATÉGORIE / URGENCE / TRI */}
      <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Recherche */}
          <div className="relative flex-1 group">
            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par référence (ex: DEM-001), objet ou description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Filtres Catégorie, Urgence et Tri */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={selectedCategorie}
              onChange={(e) => setSelectedCategorie(e.target.value)}
              className="px-3 py-2.5 bg-blue-50/50 hover:bg-blue-50 border border-blue-200 text-blue-900 font-bold rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white cursor-pointer transition-all"
            >
              <option value="all">Toutes catégories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.libelle}
                </option>
              ))}
            </select>

            <select
              value={selectedUrgence}
              onChange={(e) => setSelectedUrgence(e.target.value)}
              className="px-3 py-2.5 bg-orange-50/50 hover:bg-orange-50 border border-orange-200 text-orange-950 font-bold rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white cursor-pointer transition-all"
            >
              <option value="all">Toutes urgences</option>
              <option value="eleve">🔥 Élevée</option>
              <option value="moyen">⚡ Moyenne</option>
              <option value="faible">☕ Faible</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'ancien' | 'urgence')}
              className="px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:bg-white cursor-pointer transition-all"
            >
              <option value="recent">Tri : Plus récent</option>
              <option value="ancien">Tri : Plus ancien</option>
              <option value="urgence">Tri : Par urgence</option>
            </select>
          </div>

        </div>
      </div>

      {/* 3. LISTE DES CARTES DEMANDES */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-xs text-slate-400 font-medium">Chargement de vos demandes...</p>
        </div>
      ) : filteredDemandes.length === 0 ? (
        <div className="p-12 sm:p-16 text-center bg-white border border-slate-200 rounded-3xl space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-100 to-orange-100 flex items-center justify-center text-blue-600 mx-auto shadow-2xs animate-float">
            <Inbox className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">Aucune demande trouvée</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || selectedCategorie !== 'all' || selectedUrgence !== 'all'
                ? 'Aucune demande ne correspond à vos critères de recherche.'
                : 'Vous n\'avez actuellement aucune demande dans cette vue.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDemandes.map((item) => {
            const statutCouleur = item.statut_details?.couleur || '#2563eb';
            const statutLibelle = item.statut_details?.libelle || 'En attente';

            return (
              <Link
                key={item.id}
                href={`/demandes/${item.id}`}
                className="block p-4 sm:p-5 bg-white border border-slate-200/90 hover:bg-white rounded-2xl shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-blue-300 transition-all duration-200 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Gauche : Détails */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
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
                        <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                          {item.categorie_details.libelle}
                        </span>
                      )}

                      {/* Évaluation si résolu */}
                      {item.note_satisfaction && (
                        <span className="text-[11px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 flex items-center gap-1">
                          <span>★ {item.note_satisfaction}/5</span>
                        </span>
                      )}
                    </div>

                    <div>
                      <h2 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {item.objet}
                      </h2>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-medium">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 font-medium pt-1">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(item.date_creation)}
                      </span>
                    </div>
                  </div>

                  {/* Droite : Flèche d'accès */}
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors self-end sm:self-center">
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
