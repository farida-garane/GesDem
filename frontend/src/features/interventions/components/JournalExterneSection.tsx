'use client';

import React, { useState } from 'react';
import { EscaladeExterne, StatutEscalade, TypeEchange } from '@/types/escalade';
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

  // Formulaire d'ajout d'échange
  const [typeEchange, setTypeEchange] = useState<TypeEchange>('email');
  const [sujetEchange, setSujetEchange] = useState('');
  const [contenuEchange, setContenuEchange] = useState('');
  const [isSubmittingEchange, setIsSubmittingEchange] = useState(false);

  // Mise à jour rapide de statut
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
      // Handle error silently or refresh
    } finally {
      setUpdatingStatutId(null);
    }
  };

  const handleAddEchange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contenuEchange.trim() || !activeEscalade) return;

    setIsSubmittingEchange(true);
    try {
      await escaladeService.createEchange({
        escalade: activeEscalade.id,
        type_echange: typeEchange,
        sujet: sujetEchange.trim() || undefined,
        contenu: contenuEchange.trim(),
      });
      setSujetEchange('');
      setContenuEchange('');
      onRefresh();
    } catch {
      // Error
    } finally {
      setIsSubmittingEchange(false);
    }
  };

  const getStatutBadge = (statut: StatutEscalade) => {
    switch (statut) {
      case 'en_cours_reparation':
        return {
          label: 'En cours de réparation / SAV',
          style: 'bg-[#E8F1FF] text-[#002B7F] border-[#B3D1FF]',
        };
      case 'en_attente_devis':
        return {
          label: 'En attente de devis',
          style: 'bg-amber-100 text-amber-950 border-amber-300',
        };
      case 'en_attente_livraison':
        return {
          label: 'En attente de pièces / livraison',
          style: 'bg-indigo-100 text-indigo-950 border-indigo-300',
        };
      case 'repare_retourne':
        return {
          label: 'Réparé & retourné',
          style: 'bg-emerald-100 text-emerald-950 border-emerald-300',
        };
      case 'annule':
      default:
        return {
          label: 'Annulé',
          style: 'bg-slate-200 text-slate-800 border-slate-300',
        };
    }
  };

  const getTypeEchangeLabel = (type: TypeEchange) => {
    switch (type) {
      case 'email':
        return 'Email échangé';
      case 'appel':
        return 'Appel téléphonique';
      case 'devis':
        return 'Devis / Facturation';
      case 'expedition':
        return 'Expédition / Réception';
      case 'note':
      default:
        return 'Note interne SAV';
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Non renseignée';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const badge = getStatutBadge(activeEscalade.statut);

  return (
    <div className="bg-white border border-[#CBD5E1] rounded-3xl p-6 sm:p-7 space-y-6 shadow-xs animate-fade-in">
      
      {/* En-tête de la section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#002B7F]">
              Sous-traitance & Prestataire Externe
            </h2>
            <span className={`px-3 py-0.5 rounded-lg text-xs font-black border ${badge.style}`}>
              {badge.label}
            </span>
          </div>
          <p className="text-xs text-[#475569] font-medium mt-1">
            Dossier confié à un intervenant extérieur (SAV, opérateur réseau, mainteneur).
          </p>
        </div>

        {/* Sélecteur si plusieurs délégations */}
        {escalades.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#475569]">Dossier tiers :</span>
            <select
              value={activeEscalade.id}
              onChange={(e) => setSelectedEscaladeId(Number(e.target.value))}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#071530] focus:outline-none focus:border-[#002B7F]"
            >
              {escalades.map((esc) => (
                <option key={esc.id} value={esc.id}>
                  {esc.nom_prestataire} ({esc.reference_externe || `ID-${esc.id}`})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Cartouche Récapitulatif du Prestataire */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#F4F7FB] border border-slate-100">
        
        {/* Prestataire & Réf */}
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-[#475569]">
            Prestataire / Partenaire
          </p>
          <p className="text-sm font-black text-[#002B7F]">
            {activeEscalade.nom_prestataire}
          </p>
          {activeEscalade.reference_externe && (
            <p className="text-xs font-bold text-[#071530] font-mono">
              Réf externe : {activeEscalade.reference_externe}
            </p>
          )}
        </div>

        {/* Contacts */}
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-[#475569]">
            Interlocuteur & Coordonnées
          </p>
          <p className="text-xs font-bold text-[#071530]">
            {activeEscalade.contact_nom || 'Non spécifié'}
          </p>
          <p className="text-xs text-[#475569] font-medium">
            {activeEscalade.contact_email && <span>{activeEscalade.contact_email} </span>}
            {activeEscalade.contact_telephone && <span>({activeEscalade.contact_telephone})</span>}
            {!activeEscalade.contact_email && !activeEscalade.contact_telephone && 'Aucun contact direct'}
          </p>
        </div>

        {/* Dates & Coûts */}
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-[#475569]">
            Délais & Suivi Budgétaire
          </p>
          <p className="text-xs font-semibold text-[#071530]">
            Envoyé le : {formatDate(activeEscalade.date_envoi)}
          </p>
          {activeEscalade.date_retour_prevue && (
            <p className="text-xs font-semibold text-[#071530]">
              Retour prévu : {formatDate(activeEscalade.date_retour_prevue)}
            </p>
          )}
          {activeEscalade.cout_estime !== null && activeEscalade.cout_estime !== undefined && (
            <p className="text-xs font-black text-[#002B7F]">
              Montant estimé : {activeEscalade.cout_estime} € / FCFA
            </p>
          )}
        </div>

      </div>

      {/* Motif de l'escalade */}
      <div className="space-y-1">
        <p className="text-[11px] font-black uppercase tracking-wider text-[#475569]">
          Motif & Diagnostic transmis au tiers
        </p>
        <p className="text-xs font-semibold text-[#071530] bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed whitespace-pre-wrap">
          {activeEscalade.motif}
        </p>
      </div>

      {/* Mise à jour rapide de l'état (Pour les techniciens / Services généraux) */}
      {canEdit && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#CBD5E1]">
          <div>
            <p className="text-xs font-black text-[#071530]">
              Changer l&apos;état chez le prestataire :
            </p>
            <p className="text-[11px] text-[#475569] font-medium">
              Mettez à jour dès que le tiers envoie le devis, les pièces ou restitue le matériel réparé.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={activeEscalade.statut}
              onChange={(e) => handleUpdateStatut(activeEscalade.id, e.target.value as StatutEscalade)}
              disabled={updatingStatutId === activeEscalade.id}
              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-[#071530] cursor-pointer focus:outline-none focus:border-[#002B7F]"
            >
              <option value="en_cours_reparation">En cours de réparation / SAV</option>
              <option value="en_attente_devis">En attente de devis</option>
              <option value="en_attente_livraison">En attente de pièces / livraison</option>
              <option value="repare_retourne">Réparé & retourné aux locaux</option>
              <option value="annule">Annulé</option>
            </select>
          </div>
        </div>
      )}

      {/* JOURNAL DES TRANSACTIONS & ÉCHANGES */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#002B7F]">
            Historique des Transactions & Échanges ({activeEscalade.echanges.length})
          </h3>
        </div>

        {/* Liste des échanges */}
        <div className="space-y-3">
          {activeEscalade.echanges.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-[#475569] font-medium">
              Aucune transaction consignée pour l&apos;instant. Utilisez le formulaire ci-dessous pour consigner un appel, un email ou une note d&apos;expédition.
            </div>
          ) : (
            activeEscalade.echanges.map((ech) => {
              const auteurNom = ech.auteur_details?.nom || ech.auteur_details?.email || 'Technicien';
              return (
                <div
                  key={ech.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-black bg-[#E8F1FF] text-[#002B7F] border border-[#B3D1FF]">
                        {getTypeEchangeLabel(ech.type_echange)}
                      </span>
                      {ech.sujet && (
                        <span className="text-xs font-black text-[#071530]">
                          {ech.sujet}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#475569] font-medium">
                      <span>Par {auteurNom} le {formatDate(ech.date_creation)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#071530] font-semibold whitespace-pre-wrap leading-relaxed">
                    {ech.contenu}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Formulaire d'ajout d'une nouvelle entrée dans le journal */}
        {canEdit && (
          <form onSubmit={handleAddEchange} className="p-4 rounded-2xl bg-[#F4F7FB] border border-slate-200 space-y-3">
            <p className="text-xs font-black text-[#002B7F] uppercase tracking-wider">
              Consigner une nouvelle transaction / échange
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-black text-[#475569] uppercase tracking-wider mb-1">
                  Type d&apos;échange
                </label>
                <select
                  value={typeEchange}
                  onChange={(e) => setTypeEchange(e.target.value as TypeEchange)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#071530] focus:outline-none focus:border-[#002B7F] cursor-pointer"
                >
                  <option value="email">Email échangé</option>
                  <option value="appel">Appel téléphonique</option>
                  <option value="devis">Devis / Facturation reçu</option>
                  <option value="expedition">Expédition / Réception matériel</option>
                  <option value="note">Note interne SAV</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black text-[#475569] uppercase tracking-wider mb-1">
                  Objet / Sujet (Optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Confirmation de prise en charge par le SAV"
                  value={sujetEchange}
                  onChange={(e) => setSujetEchange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-[#071530] focus:outline-none focus:border-[#002B7F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-[#475569] uppercase tracking-wider mb-1">
                Détail de la transaction ou compte-rendu *
              </label>
              <textarea
                rows={2}
                required
                placeholder="Ex: Appel avec M. Martin : la pièce est en transit et sera livrée demain matin."
                value={contenuEchange}
                onChange={(e) => setContenuEchange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-[#071530] focus:outline-none focus:border-[#002B7F] resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmittingEchange}
                className="px-4 py-2 rounded-xl bg-[#002B7F] hover:bg-[#001f5c] text-white text-xs font-black transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingEchange ? 'Enregistrement...' : 'Ajouter au journal tiers'}
              </button>
            </div>
          </form>
        )}

      </div>

    </div>
  );
}
