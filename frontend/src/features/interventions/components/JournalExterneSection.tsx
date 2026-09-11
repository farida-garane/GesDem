'use client';

import React, { useState } from 'react';
import { EscaladeExterne, StatutEscalade } from '@/types/escalade';
import { escaladeService } from '@/services/escalade.service';

interface JournalExterneSectionProps {
  escalades: EscaladeExterne[];
  onRefresh: () => void;
  canEdit: boolean;
}

export function JournalExterneSection({
  escalades,
  onRefresh,
  canEdit,
}: JournalExterneSectionProps) {
  const [selectedEscaladeId, setSelectedEscaladeId] = useState<number | null>(
    escalades.length > 0 ? escalades[0].id : null
  );

  const [contenuNote, setContenuNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingStatutId, setUpdatingStatutId] = useState<number | null>(null);

  if (escalades.length === 0) {
    return null;
  }

  const activeEscalade =
    escalades.find((e) => e.id === selectedEscaladeId) || escalades[0];

  const handleUpdateStatut = async (escaladeId: number, nouveauStatut: StatutEscalade) => {
    setUpdatingStatutId(escaladeId);
    try {
      const payload: Partial<EscaladeExterne> = { statut: nouveauStatut };
      if (nouveauStatut === 'repare_retourne') {
        payload.date_retour_reelle = new Date().toISOString();
      }
      await escaladeService.updateEscalade(escaladeId, payload);
      onRefresh();
    } catch {
      // Ignorer ou rafraîchir
    } finally {
      setUpdatingStatutId(null);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contenuNote.trim() || !activeEscalade) return;

    setIsSubmitting(true);
    try {
      await escaladeService.createEchange({
        escalade: activeEscalade.id,
        type_echange: 'note',
        contenu: contenuNote.trim(),
      });
      setContenuNote('');
      onRefresh();
    } catch {
      // Erreur
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xs animate-fade-in">
      
      {/* 1. EN-TÊTE ÉPURÉ & PRONONCÉ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#002B7F]" />
            <h2 className="text-sm font-black uppercase tracking-wider text-[#002B7F]">
              Suivi Prestataire : {activeEscalade.nom_prestataire}
            </h2>
            {activeEscalade.reference_externe && (
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-slate-100 text-[#071530]">
                Réf: {activeEscalade.reference_externe}
              </span>
            )}
          </div>
          {activeEscalade.contact_nom && (
            <p className="text-xs text-[#475569] font-medium pl-5">
              Contact : <strong className="text-[#071530]">{activeEscalade.contact_nom}</strong> 
              {activeEscalade.contact_telephone ? ` (${activeEscalade.contact_telephone})` : ''}
            </p>
          )}
        </div>

        {/* Changement rapide du statut chez le prestataire */}
        {canEdit ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#475569]">État SAV :</span>
            <select
              value={activeEscalade.statut}
              onChange={(e) => handleUpdateStatut(activeEscalade.id, e.target.value as StatutEscalade)}
              disabled={updatingStatutId === activeEscalade.id}
              className="px-3 py-1.5 bg-[#F4F7FB] hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-[#002B7F] cursor-pointer focus:outline-none focus:border-[#002B7F]"
            >
              <option value="en_cours_reparation">En cours de réparation</option>
              <option value="en_attente_devis">En attente de devis</option>
              <option value="en_attente_livraison">En attente de livraison</option>
              <option value="repare_retourne">Réparé &amp; retourné</option>
              <option value="annule">Annulé</option>
            </select>
          </div>
        ) : (
          <span className="px-3 py-1 rounded-xl text-xs font-black bg-[#E8F1FF] text-[#002B7F]">
            {activeEscalade.statut === 'repare_retourne' ? 'Réparé & retourné' : 'En cours chez le tiers'}
          </span>
        )}
      </div>

      {/* 2. MOTIF DU CONFIEMENT */}
      {activeEscalade.motif && (
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-[#071530] font-medium leading-relaxed">
          <strong className="text-[#002B7F]">Diagnostic transmis : </strong>
          {activeEscalade.motif}
        </div>
      )}

      {/* 3. FIL DES REMARQUES & SUIVI (ESSENTIEL) */}
      <div className="space-y-3 pt-1">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#002B7F]">
          Notes &amp; Journal de suivi ({activeEscalade.echanges.length})
        </h3>

        {/* Liste simple des notes */}
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {activeEscalade.echanges.length === 0 ? (
            <p className="text-xs text-slate-400 font-medium italic">
              Aucune note ajoutée pour le moment.
            </p>
          ) : (
            activeEscalade.echanges.map((ech) => {
              const auteurNom = ech.auteur_details?.nom || ech.auteur_details?.email || 'Technicien';
              return (
                <div
                  key={ech.id}
                  className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#002B7F]">{auteurNom}</span>
                    <span className="text-slate-400 font-medium">{formatDate(ech.date_creation)}</span>
                  </div>
                  <p className="text-[#071530] font-medium leading-relaxed whitespace-pre-wrap">
                    {ech.contenu}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Saisie rapide d'une note (Simplifiée à l'essentiel) */}
        {canEdit && (
          <form onSubmit={handleAddNote} className="pt-2 flex items-center gap-2">
            <input
              type="text"
              required
              placeholder="Ajouter une note de suivi (ex: Appelé le SAV, retour prévu mercredi)..."
              value={contenuNote}
              onChange={(e) => setContenuNote(e.target.value)}
              disabled={isSubmitting}
              className="flex-1 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-[#071530] placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#B3D1FF] transition-all font-semibold"
            />
            <button
              type="submit"
              disabled={!contenuNote.trim() || isSubmitting}
              className="bg-[#002B7F] hover:bg-[#001F5C] text-white px-4 py-2 rounded-2xl text-xs font-bold shrink-0 cursor-pointer disabled:opacity-50 transition-all active:scale-95 shadow-xs"
            >
              {isSubmitting ? '...' : 'Ajouter'}
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
