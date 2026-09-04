'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { SlaBadge } from '@/components/ui/SlaBadge';
import { exportDemandesToCsv } from '@/utils/exportUtils';
import { demandeService } from '@/services/demande.service';
import { useAuth } from '@/context/AuthContext';
import { Demande, Categorie, Statut } from '@/types/demande';
import {
  Loader2
} from 'lucide-react';

export function InterventionList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();

  // Contrôle d'accès strict : l'espace intervenant exige une connexion avec un compte Intervenant
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role === 'demandeur') {
        router.push('/login/intervenant');
      }
    }
  }, [user, authLoading, router]);

  const currentVue = searchParams.get('vue') || 'all';

  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [statuts, setStatuts] = useState<Statut[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Filtres & Tri
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState<string>('all');
  const [selectedUrgence, setSelectedUrgence] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'ancien' | 'urgence'>('recent');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [demandesData, categoriesData, statutsData] = await Promise.all([
        demandeService.getDemandes(),
        demandeService.getCategories(),
        demandeService.getStatuts(),
      ]);
      setDemandes(demandesData);
      setCategories(categoriesData);
      setStatuts(statutsData);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Prise en charge rapide d'un dossier en 1 clic
  const handlePrendreEnCharge = async (e: React.MouseEvent, demande: Demande) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;

    setActionLoadingId(demande.id);
    try {
      const statutEnCours = statuts.find(
        (s) => s.libelle.toLowerCase().includes('cours') || s.ordre === 2
      );

      await demandeService.updateDemandeStatut(demande.id, {
        technicien: user.id,
        ...(statutEnCours ? { statut: statutEnCours.id } : {}),
      });

      await fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur lors de la prise en charge");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtrage et Tri des demandes
  const filteredDemandes = useMemo(() => {
    const list = demandes.filter((item) => {
      // 1. Filtre par vue (Sidebar)
      if (currentVue === 'mes_interventions') {
        const isMine =
          (user?.id && item.technicien?.id === user.id) ||
          (user?.email && item.technicien?.email === user.email) ||
          (user?.nom && item.technicien?.nom === user.nom);
        if (!isMine) return false;
      } else if (currentVue === 'en_attente') {
        const isAttente =
          !item.technicien ||
          item.statut_details?.libelle?.toLowerCase().includes('attente') ||
          item.statut === 1;
        if (!isAttente) return false;
      }

      // 2. Filtre par catégorie
      if (selectedCategorie !== 'all') {
        if (String(item.categorie) !== selectedCategorie) return false;
      }

      // 3. Filtre par urgence
      if (selectedUrgence !== 'all') {
        if (item.urgence !== selectedUrgence) return false;
      }

      // 4. Recherche textuelle
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const refMatch = (item.reference || `DEM-${item.id}`).toLowerCase().includes(q);
        const objMatch = item.objet.toLowerCase().includes(q);
        const descMatch = item.description.toLowerCase().includes(q);
        const demandeurMatch = (item.demandeur?.nom || item.demandeur?.email || '').toLowerCase().includes(q);
        const techMatch = (item.technicien?.nom || item.technicien?.email || '').toLowerCase().includes(q);
        if (!refMatch && !objMatch && !descMatch && !demandeurMatch && !techMatch) return false;
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
  }, [demandes, currentVue, selectedCategorie, selectedUrgence, searchQuery, sortBy, user]);

  const viewTitles = {
    all: {
      title: 'Toutes les demandes à traiter',
      desc: "File d'attente globale de toutes les requêtes internes de l'entreprise.",
    },
    mes_interventions: {
      title: 'Mes dossiers pris en charge',
      desc: 'Dossiers en cours de traitement assignés à votre compte.',
    },
    en_attente: {
      title: 'Demandes en attente de prise en charge',
      desc: 'Dossiers sans intervenant ou en attente d’affectation.',
    },
  };

  const currentMeta = viewTitles[currentVue as keyof typeof viewTitles] || viewTitles.all;

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
      
      {/* 1. EN-TÊTE DE LA PAGE INTERVENTIONS */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,43,127,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-black text-[#002B7F] tracking-tight">
              {currentMeta.title}
            </h1>
            <span className="px-3.5 py-1 rounded-full text-sm font-black bg-[#E8F1FF] text-[#002B7F] border border-[#B3D1FF]">
              {filteredDemandes.length}
            </span>
          </div>
          <p className="text-sm text-[#475569] font-semibold mt-1.5">
            {currentMeta.desc}
          </p>
        </div>

        {/* Bouton Export Excel / CSV */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => exportDemandesToCsv(filteredDemandes, 'dossiers_interventions')}
            disabled={filteredDemandes.length === 0}
            className="px-5 py-3.5 rounded-2xl bg-[#002B7F] hover:bg-[#001f5c] text-white text-xs sm:text-sm font-black transition-all disabled:opacity-40 cursor-pointer shadow-md active:scale-95 shrink-0"
          >
            <span>Exporter Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* 2. BARRE DE RECHERCHE ET FILTRES */}
      <div className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,43,127,0.03)] space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Recherche */}
          <div className="relative flex-1 group">
            <input
              type="text"
              placeholder="Rechercher par référence (ex: DEM-001), objet, demandeur, mot-clé..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-2xl text-sm sm:text-base text-[#071530] placeholder-[#64748b] focus:outline-none focus:border-[#002B7F] focus:bg-white transition-all font-semibold"
            />
          </div>

          {/* Filtres Catégorie, Urgence et Tri */}
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            <div className="relative">
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
            </div>

            <div className="relative">
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
            </div>

            <div className="relative">
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
      </div>

      {/* 3. LISTE DES DOSSIERS D'INTERVENTION */}
      {loading ? (
        <div className="py-24 text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#002B7F] mx-auto" />
          <p className="text-sm font-bold text-[#475569]">Chargement des dossiers...</p>
        </div>
      ) : filteredDemandes.length === 0 ? (
        <div className="py-16 px-6 text-center bg-white border border-slate-100 rounded-3xl space-y-3 shadow-xs">
          <p className="text-base font-black text-[#071530]">Aucune intervention trouvée</p>
          <p className="text-sm text-[#475569] font-medium max-w-md mx-auto">
            Aucun dossier ne correspond aux critères sélectionnés.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDemandes.map((item) => {
            const isAssignedToMe =
              (user?.id && item.technicien?.id === user.id) ||
              (user?.email && item.technicien?.email === user.email) ||
              (user?.nom && item.technicien?.nom === user.nom);

            const statutLibelle = item.statut_details?.libelle || 'En attente';

            return (
              <Link
                key={item.id}
                href={`/interventions/${item.id}`}
                className="block p-6 sm:p-7 bg-white border border-slate-100 hover:border-[#B3D1FF] rounded-3xl shadow-[0_2px_16px_rgba(0,43,127,0.03)] hover:shadow-[0_8px_28px_rgba(0,43,127,0.08)] transition-all duration-200 group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  
                  {/* Gauche : Infos ticket */}
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

                      {/* Évaluation si résolu */}
                      {item.note_satisfaction && (
                        <span className="text-xs font-black text-amber-950 bg-amber-100 px-3 py-1 rounded-xl border border-amber-300 flex items-center gap-1">
                          <span>{item.note_satisfaction}/5</span>
                        </span>
                      )}
                    </div>

                    {/* Titre & Description */}
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-[#071530] group-hover:text-[#002B7F] transition-colors leading-snug">
                        {item.objet}
                      </h2>
                      <p className="text-sm text-[#475569] font-medium line-clamp-2 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Méta demandeur & Date */}
                    <div className="flex items-center gap-4 text-xs sm:text-sm text-[#475569] font-semibold pt-1 flex-wrap">
                      <span className="flex items-center gap-2 text-[#071530]">
                        <div className="w-6 h-6 rounded-full bg-[#002B7F] text-white flex items-center justify-center text-xs font-black shrink-0">
                          {(item.demandeur?.nom || item.demandeur?.email || 'D').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-black">{item.demandeur?.nom || item.demandeur?.email || 'Demandeur'}</span>
                        {item.demandeur?.departement && (
                          <span className="text-[#475569] font-medium">({item.demandeur.departement})</span>
                        )}
                      </span>

                      <span>
                        Date : {formatDate(item.date_creation)}
                      </span>
                    </div>
                  </div>

                  {/* Droite : Statut Intervenant & Actions */}
                  <div className="flex sm:flex-row lg:flex-col items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                    
                    {/* Badge intervenant ou Bouton Prendre en charge en Orange Vif (#FF5E00) */}
                    {item.technicien ? (
                      <span className={`inline-flex items-center text-xs sm:text-sm font-black px-4 py-2 rounded-2xl ${
                        isAssignedToMe
                          ? 'bg-[#E8F1FF] text-[#002B7F] border border-[#B3D1FF]'
                          : 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                      }`}>
                        <span>{isAssignedToMe ? 'Assigné à ..' : item.technicien.nom || item.technicien.email}</span>
                      </span>
                    ) : (
                      <button
                        onClick={(e) => handlePrendreEnCharge(e, item)}
                        disabled={actionLoadingId === item.id}
                        className="inline-flex items-center px-5 py-2.5 rounded-2xl bg-[#FF5E00] hover:bg-[#E05200] text-white text-xs sm:text-sm font-black transition-all active:scale-95 cursor-pointer shadow-md"
                      >
                        {actionLoadingId === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        <span>Prendre en charge</span>
                      </button>
                    )}

                    {/* Bouton secondaire Traiter */}
                    <div className="flex items-center px-4 py-2 rounded-2xl bg-slate-50 text-xs sm:text-sm font-black text-[#002B7F] group-hover:bg-[#E8F1FF] border border-slate-100 group-hover:border-[#B3D1FF] transition-colors">
                      <span>Traiter &rarr;</span>
                    </div>

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
