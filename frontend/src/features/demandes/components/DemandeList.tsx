'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { SlaBadge } from '@/components/ui/SlaBadge';
import { demandeService } from '@/services/demande.service';
import { Demande, Categorie } from '@/types/demande';
import {
  Loader2
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
          desc: 'Tickets en attente de prise en charge par les Services Généraux.',
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
    <div className="w-full space-y-8 pb-16 animate-fade-in">
      
      {/* 1. EN-TÊTE MODERNE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-5 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-black text-[#002B7F] tracking-tight">
              {viewMeta.title}
            </h1>
            <span className="px-3.5 py-1 rounded-full text-sm font-black bg-[#E8F1FF] text-[#002B7F] border border-[#B3D1FF]">
              {filteredDemandes.length}
            </span>
          </div>
          <p className="text-sm text-[#475569] font-semibold mt-1.5">
            {viewMeta.desc}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Action principale unique : Orange Vif (#FF5E00) */}
          <Link
            href="/demandes/nouvelle"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#FF5E00] hover:bg-[#E05200] text-white text-sm font-black transition-all duration-200 shadow-md active:scale-95 cursor-pointer"
          >
            <span>Nouvelle demande</span>
          </Link>
        </div>
      </div>

      {/* 2. BARRE DE RECHERCHE & FILTRES CATÉGORIE / URGENCE / TRI */}
      <div className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,43,127,0.03)] space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* Recherche */}
          <div className="relative flex-1 group">
            <input
              type="text"
              placeholder="Rechercher par référence (ex: DEM-001), objet ou description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-2xl text-sm sm:text-base text-[#071530] placeholder:text-[#64748b] focus:outline-none focus:border-[#002B7F] focus:bg-white transition-all font-semibold"
            />
          </div>

          {/* Filtres Catégorie, Urgence et Tri */}
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            <select
              value={selectedCategorie}
              onChange={(e) => setSelectedCategorie(e.target.value)}
              className="px-4 py-3.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 text-[#071530] font-bold rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-[#002B7F] focus:bg-white cursor-pointer transition-all"
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
              className="px-4 py-3.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 text-[#071530] font-bold rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-[#002B7F] focus:bg-white cursor-pointer transition-all"
            >
              <option value="all">Toutes urgences</option>
              <option value="eleve">Élevée</option>
              <option value="moyen">Moyenne</option>
              <option value="faible">Faible</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'ancien' | 'urgence')}
              className="px-4 py-3.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 text-[#071530] font-bold rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-[#002B7F] focus:bg-white cursor-pointer transition-all"
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
        <div className="py-24 text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#002B7F] mx-auto" />
          <p className="text-sm font-bold text-[#475569]">Chargement de vos demandes...</p>
        </div>
      ) : filteredDemandes.length === 0 ? (
        <div className="py-16 px-6 bg-white border border-slate-100 rounded-3xl text-center space-y-3 shadow-xs">
          <p className="text-base font-black text-[#071530]">
            Aucune demande trouvée
          </p>
          <p className="text-sm text-[#475569] font-medium max-w-md mx-auto">
            {searchQuery
              ? 'Aucune demande ne correspond à vos critères de recherche.'
              : 'Vous n\'avez actuellement aucune demande dans cette vue.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDemandes.map((item) => {
            const statutLibelle = item.statut_details?.libelle || 'En attente';

            return (
              <Link
                key={item.id}
                href={`/demandes/${item.id}`}
                className="block p-6 sm:p-7 bg-white border border-slate-100 hover:border-[#B3D1FF] rounded-3xl shadow-[0_2px_16px_rgba(0,43,127,0.03)] hover:shadow-[0_8px_28px_rgba(0,43,127,0.08)] transition-all duration-200 group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                  
                  {/* Gauche : Détails */}
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-xs font-black text-[#002B7F] bg-[#E8F1FF] px-3 py-1 rounded-xl border border-[#B3D1FF]">
                        {item.reference || `DEM-${item.id}`}
                      </span>

                      <PriorityBadge urgence={item.urgence} />

                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-[#E8F1FF] text-[#002B7F] border border-[#B3D1FF]">
                        <span className="w-2 h-2 rounded-full bg-[#002B7F]" />
                        {statutLibelle}
                      </span>

                      {item.categorie_details && (
                        <span className="text-xs font-bold text-[#475569] bg-slate-100 px-3 py-1 rounded-xl">
                          {item.categorie_details.libelle}
                        </span>
                      )}
                    </div>

                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-[#071530] group-hover:text-[#002B7F] transition-colors leading-snug">
                        {item.objet}
                      </h2>
                      <p className="text-sm text-[#475569] line-clamp-2 mt-1 font-medium leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs sm:text-sm text-[#475569] font-semibold pt-1">
                      <span>Créée le : {formatDate(item.date_creation)}</span>
                    </div>
                  </div>

                  {/* Droite : Bouton secondaire */}
                  <div className="flex items-center gap-1 px-5 py-3 rounded-2xl bg-slate-50 group-hover:bg-[#E8F1FF] text-xs sm:text-sm font-black text-[#002B7F] transition-colors self-end md:self-center shrink-0 border border-slate-100 group-hover:border-[#B3D1FF]">
                    <span>Voir le dossier &rarr;</span>
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
