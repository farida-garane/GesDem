'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { demandeService } from '@/services/demande.service';
import { useAuth } from '@/context/AuthContext';
import { Demande, Categorie, Statut } from '@/types/demande';
import {
  Search,
  Loader2,
  Inbox,
  ArrowUpRight,
  RotateCcw,
  Calendar,
  Layers,
  UserCheck,
  Clock,
  Wrench,
  AlertTriangle,
  FolderOpen,
  CheckCircle2,
  Building2,
  User,
  Filter
} from 'lucide-react';

export function InterventionList() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

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
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-fade-in">
      
      {/* 1. EN-TÊTE DE LA PAGE INTERVENTIONS */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Accent de couleur discret en arrière-plan */}
        <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-bl from-orange-500/10 via-blue-500/10 to-transparent rounded-bl-full pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <Wrench className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {currentMeta.title}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-700 border border-blue-200">
                {filteredDemandes.length}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              {currentMeta.desc}
            </p>
          </div>
        </div>
      </div>

      {/* 2. BARRE DE RECHERCHE ET FILTRES */}
      <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Recherche avec focus bleu */}
          <div className="relative flex-1 group">
            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par référence (ex: DEM-001), objet, demandeur, mot-clé..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-3 focus:ring-blue-500/15 focus:border-blue-600 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Filtres Catégorie, Urgence et Tri */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="relative">
              <select
                value={selectedCategorie}
                onChange={(e) => setSelectedCategorie(e.target.value)}
                className="px-3.5 py-2.5 bg-blue-50/50 hover:bg-blue-50 border border-blue-200 text-blue-900 font-bold rounded-xl text-xs focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:bg-white cursor-pointer transition-all"
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
                className="px-3.5 py-2.5 bg-orange-50/50 hover:bg-orange-50 border border-orange-200 text-orange-950 font-bold rounded-xl text-xs focus:outline-none focus:ring-3 focus:ring-orange-500/20 focus:bg-white cursor-pointer transition-all"
              >
                <option value="all">Toutes urgences</option>
                <option value="eleve">🔥 Élevée</option>
                <option value="moyen">⚡ Moyenne</option>
                <option value="faible">☕ Faible</option>
              </select>
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'ancien' | 'urgence')}
                className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:bg-white cursor-pointer transition-all"
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
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-xs text-slate-400 font-medium">Chargement des dossiers...</p>
        </div>
      ) : filteredDemandes.length === 0 ? (
        <div className="p-12 sm:p-16 text-center bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-100 to-orange-100 flex items-center justify-center text-blue-600 mx-auto shadow-2xs animate-float">
            <Inbox className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Aucune demande trouvée</h3>
            <p className="text-xs text-slate-500 mt-1">
              Aucune demande ne correspond aux critères sélectionnés.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredDemandes.map((item) => {
            const isAssignedToMe =
              (user?.id && item.technicien?.id === user.id) ||
              (user?.email && item.technicien?.email === user.email) ||
              (user?.nom && item.technicien?.nom === user.nom);

            const statutCouleur = item.statut_details?.couleur || '#2563eb';
            const statutLibelle = item.statut_details?.libelle || 'En attente';

            // Bordure gauche thématique selon urgence ou statut
            const borderAccent =
              item.urgence === 'eleve'
                ? 'border-l-4 border-l-orange-500 hover:border-l-orange-600'
                : isAssignedToMe
                ? 'border-l-4 border-l-blue-600 hover:border-l-blue-700'
                : 'border-l-4 border-l-slate-300 hover:border-l-blue-500';

            return (
              <Link
                key={item.id}
                href={`/interventions/${item.id}`}
                className={`block p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group ${borderAccent}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Gauche : Infos ticket */}
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
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{ backgroundColor: statutCouleur }}
                        />
                        {statutLibelle}
                      </span>

                      {item.categorie_details && (
                        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                          {item.categorie_details.libelle}
                        </span>
                      )}

                      {/* Évaluation si résolu */}
                      {item.note_satisfaction && (
                        <span className="text-[11px] font-black text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200 flex items-center gap-1">
                          <span>★ {item.note_satisfaction}/5</span>
                        </span>
                      )}
                    </div>

                    {/* Titre & Description */}
                    <div>
                      <h2 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {item.objet}
                      </h2>
                      <p className="text-xs text-slate-600 font-medium line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    </div>

                    {/* Méta demandeur & Date */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium pt-1">
                      <span className="flex items-center gap-1.5 text-slate-800">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                          {(item.demandeur?.nom || item.demandeur?.email || 'D').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold">{item.demandeur?.nom || item.demandeur?.email || 'Demandeur'}</span>
                        {item.demandeur?.departement && (
                          <span className="text-slate-500 font-normal">({item.demandeur.departement})</span>
                        )}
                      </span>

                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(item.date_creation)}
                      </span>
                    </div>
                  </div>

                  {/* Droite : Statut Intervenant & Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    
                    {/* Badge intervenant ou Bouton Prendre en charge en Orange Dégradé */}
                    {item.technicien ? (
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border ${
                        isAssignedToMe
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{isAssignedToMe ? 'Assigné à moi' : item.technicien.nom || item.technicien.email}</span>
                      </span>
                    ) : (
                      <button
                        onClick={(e) => handlePrendreEnCharge(e, item)}
                        disabled={actionLoadingId === item.id}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-extrabold transition-all shadow-sm hover:shadow-md hover:shadow-orange-500/20 active:scale-95 cursor-pointer"
                      >
                        {actionLoadingId === item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Wrench className="w-3.5 h-3.5" />
                        )}
                        <span>Prendre en charge</span>
                      </button>
                    )}

                    {/* Flèche d'ouverture avec badge bleu */}
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                      <span>Traiter</span>
                      <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
