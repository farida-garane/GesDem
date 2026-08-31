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

  // Filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState<string>('all');
  const [selectedUrgence, setSelectedUrgence] = useState<string>('all');

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

  // Prise en charge rapide d'un ticket en 1 clic
  const handlePrendreEnCharge = async (e: React.MouseEvent, demande: Demande) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;

    setActionLoadingId(demande.id);
    try {
      // Trouve le statut "En cours" ou 2
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



  // Filtrage des demandes
  const filteredDemandes = useMemo(() => {
    return demandes.filter((item) => {
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
  }, [demandes, currentVue, selectedCategorie, selectedUrgence, searchQuery, user]);

  const viewTitles = {
    all: {
      title: 'Toutes les demandes à traiter',
      desc: "File d'attente globale de toutes les demandes d'intervention internes.",
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    mes_interventions: {
      title: 'Mes interventions assignées',
      desc: 'Vos tâches en cours de traitement assignées à votre compte technicien.',
      badgeColor: 'bg-blue-100/80 text-blue-800 border-blue-200/80',
    },
    en_attente: {
      title: 'Interventions en attente de prise en charge',
      desc: 'Tickets sans technicien ou en attente d’affectation.',
      badgeColor: 'bg-amber-100/80 text-amber-800 border-amber-200/80',
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
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      
      {/* 1. EN-TÊTE DE LA PAGE INTERVENTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {currentMeta.title}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentMeta.badgeColor}`}>
              {filteredDemandes.length} ticket{filteredDemandes.length > 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {currentMeta.desc}
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="self-start sm:self-auto p-2 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs text-xs font-semibold flex items-center gap-2"
          title="Actualiser la liste"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* 2. BARRE DE RECHERCHE ET FILTRES */}
      <Card className="p-3.5 bg-white border border-slate-200/80 shadow-xs rounded-2xl">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Recherche */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par référence, objet, demandeur, mot-clé..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:bg-white transition-all"
            />
          </div>

          {/* Filtres Catégorie et Urgence */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={selectedCategorie}
              onChange={(e) => setSelectedCategorie(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white"
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
              className="px-3 py-2 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white"
            >
              <option value="all">Toutes urgences</option>
              <option value="eleve">Élevée</option>
              <option value="moyen">Moyenne</option>
              <option value="faible">Faible</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 4. LISTE DES TICKETS D'INTERVENTION */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-7 h-7 animate-spin text-slate-800 mx-auto" />
          <p className="text-xs text-slate-400 font-medium">Chargement des interventions...</p>
        </div>
      ) : filteredDemandes.length === 0 ? (
        <Card className="p-12 text-center bg-white border border-slate-200/80 shadow-xs rounded-3xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Aucune intervention trouvée</h3>
            <p className="text-xs text-slate-400 mt-1">
              Aucune demande ne correspond aux critères sélectionnés.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredDemandes.map((item) => {
            const isAssignedToMe =
              (user?.id && item.technicien?.id === user.id) ||
              (user?.email && item.technicien?.email === user.email) ||
              (user?.nom && item.technicien?.nom === user.nom);

            const isUnassigned = !item.technicien;
            const statutCouleur = item.statut_details?.couleur || '#64748b';
            const statutLibelle = item.statut_details?.libelle || 'En attente';

            return (
              <Link
                key={item.id}
                href={`/interventions/${item.id}`}
                className="block p-4 sm:p-5 bg-white hover:bg-slate-50/80 border border-slate-200/90 rounded-2xl shadow-2xs hover:shadow-xs transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Gauche : Infos ticket */}
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

                    {/* Titre & Description */}
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {item.objet}
                      </h2>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    </div>

                    {/* Méta demandeur & Date */}
                    <div className="flex items-center gap-4 text-xs text-slate-400 font-medium pt-1">
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold">{item.demandeur?.nom || item.demandeur?.email || 'Demandeur'}</span>
                        {item.demandeur?.departement && (
                          <span className="text-slate-400">({item.demandeur.departement})</span>
                        )}
                      </span>

                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(item.date_creation)}
                      </span>
                    </div>
                  </div>

                  {/* Droite : Statut Technicien & Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    
                    {/* Badge technicien */}
                    {item.technicien ? (
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-xl border ${
                        isAssignedToMe
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{isAssignedToMe ? 'Assigné à moi' : item.technicien.nom || item.technicien.email}</span>
                      </span>
                    ) : (
                      <button
                        onClick={(e) => handlePrendreEnCharge(e, item)}
                        disabled={actionLoadingId === item.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        {actionLoadingId === item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Wrench className="w-3.5 h-3.5" />
                        )}
                        <span>Prendre en charge</span>
                      </button>
                    )}

                    {/* Flèche d'ouverture */}
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-500 group-hover:text-blue-600 transition-colors">
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
