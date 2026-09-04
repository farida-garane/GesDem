'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { SlaBadge } from '@/components/ui/SlaBadge';
import { demandeService } from '@/services/demande.service';
import { escaladeService } from '@/services/escalade.service';
import { Demande, HistoriqueStatut, Commentaire, UrgenceLevel } from '@/types/demande';
import { EscaladeExterne } from '@/types/escalade';
import {
  Loader2,
  X
} from 'lucide-react';

interface DemandeDetailViewProps {
  demandeId: string | number;
}

export function DemandeDetailView({ demandeId }: DemandeDetailViewProps) {
  const [demande, setDemande] = useState<Demande | null>(null);
  const [historique, setHistorique] = useState<HistoriqueStatut[]>([]);
  const [commentaires, setCommentaires] = useState<Commentaire[]>([]);
  const [escalades, setEscalades] = useState<EscaladeExterne[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // New Comment
  const [nouveauCommentaire, setNouveauCommentaire] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  // Modals (Annulation & Modification)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelMotif, setCancelMotif] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Validation de Clôture & Réouverture
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
  const [reopenMotif, setReopenMotif] = useState('');
  const [isReopening, setIsReopening] = useState(false);
  const [isClosingDirect, setIsClosingDirect] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editObjet, setEditObjet] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editUrgence, setEditUrgence] = useState<UrgenceLevel>('moyen');
  const [editFile, setEditFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [demandeData, historiqueData, commentairesData, escaladesData] = await Promise.all([
        demandeService.getDemandeById(demandeId),
        demandeService.getDemandeHistorique(demandeId),
        demandeService.getCommentaires(demandeId),
        escaladeService.getEscalades(demandeId),
      ]);

      setDemande(demandeData);
      setHistorique(historiqueData);
      setCommentaires(commentairesData);
      setEscalades(escaladesData);

      if (demandeData) {
        setEditObjet(demandeData.objet);
        setEditDescription(demandeData.description);
        setEditUrgence(demandeData.urgence);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la demande.');
    } finally {
      setLoading(false);
    }
  }, [demandeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Validation de Clôture définitive par le demandeur
  const handleConfirmClosure = async () => {
    if (!demande) return;
    setIsClosingDirect(true);
    try {
      await demandeService.cloturerDemande(demande.id);
      showToast('Votre demande a été clôturée avec succès !', 'success');
      await loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Erreur lors de la clôture', 'error');
    } finally {
      setIsClosingDirect(false);
    }
  };

  // Réouverture du ticket par le demandeur
  const handleConfirmReopen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demande || !reopenMotif.trim()) return;

    setIsReopening(true);
    try {
      await demandeService.rouvrirDemande(demande.id, reopenMotif.trim());
      // Ajouter un commentaire explicatif
      try {
        await demandeService.createCommentaire(
          demande.id,
          ` [Ticket Rouvert par le demandeur] Motif : ${reopenMotif.trim()}`
        );
      } catch {
        // ignorer
      }
      setIsReopenModalOpen(false);
      setReopenMotif('');
      showToast('Le ticket a été rouvert et réassigné au support technique.', 'success');
      await loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Erreur lors de la réouverture', 'error');
    } finally {
      setIsReopening(false);
    }
  };

  // Envoi d'un commentaire
  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouveauCommentaire.trim() || !demande) return;

    setSendingComment(true);
    try {
      const added = await demandeService.createCommentaire(demande.id, nouveauCommentaire.trim());
      setCommentaires((prev) => [...prev, added]);
      setNouveauCommentaire('');
      showToast('Commentaire publié avec succès !', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Erreur lors de l'envoi", 'error');
    } finally {
      setSendingComment(false);
    }
  };

  // Annulation de la demande
  const handleConfirmCancel = async () => {
    if (!demande) return;
    setIsCancelling(true);
    try {
      await demandeService.annulerDemande(demande.id, cancelMotif.trim());
      setIsCancelModalOpen(false);
      showToast('Votre demande a bien été annulée.', 'info');
      await loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Erreur lors de l'annulation", 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  // Modification de la demande
  const handleConfirmEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demande || !editObjet.trim() || !editDescription.trim()) return;

    setIsUpdating(true);
    try {
      await demandeService.updateDemande(demande.id, {
        objet: editObjet.trim(),
        description: editDescription.trim(),
        urgence: editUrgence,
        piece_jointe: editFile,
      });
      setIsEditModalOpen(false);
      showToast('Votre demande a été mise à jour !', 'success');
      await loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Erreur lors de la modification', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
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

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs font-semibold">Chargement du dossier de la demande...</p>
      </div>
    );
  }

  if (error || !demande) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <p className="text-sm font-bold text-slate-900">Demande introuvable</p>
        <Link
          href="/demandes"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-black transition-colors"
        >
          <span>Retour à mes demandes</span>
        </Link>
      </div>
    );
  }

  const statutLibelle = demande.statut_details?.libelle || 'En attente';
  const statutCouleur = demande.statut_details?.couleur || '#64748b';
  const isResolueOrCloturee = statutLibelle.toLowerCase().includes('resolu') || statutLibelle.toLowerCase().includes('cloture') || demande.statut === 4 || demande.statut === 5;
  const isPending = !demande.technicien && (demande.statut === 1 || statutLibelle.toLowerCase().includes('attente'));

  // Calcul des étapes du traitement
  const steps = [
    { label: 'Demande créée', completed: true },
    { label: 'Demande assignée', completed: Boolean(demande.technicien) || demande.statut! >= 2 },
    { label: 'Intervention en cours', completed: demande.statut! >= 3, current: demande.statut === 3 },
    { label: 'Résolue', completed: demande.statut! >= 4, current: demande.statut === 4 },
    { label: 'Clôturée', completed: demande.statut! >= 5, current: demande.statut === 5 },
  ];

  return (
    <div className="w-full space-y-8 animate-fade-in pb-16 relative">
      
      {/* TOAST FLOTTANT DE NOTIFICATION */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-bounce duration-300">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-bold ${
            toast.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : 'bg-blue-900 text-white border-blue-700'
          }`}>
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-white/70 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 1. EN-TÊTE DE NAVIGATION & ACTIONS */}
      <div className="space-y-3">
        <Link
          href="/demandes"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#002B7F] hover:text-[#0047cc] transition-colors group"
        >
          <span>&larr; Retour aux demandes</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-sm font-black text-[#002B7F] bg-[#E8F1FF] px-3 py-0.5 rounded-lg border border-[#B3D1FF]">
                {demande.reference || `DEM-0${demande.id}`}
              </span>
              <PriorityBadge urgence={demande.urgence} />
              <SlaBadge demande={demande} />
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-lg text-xs font-black bg-[#E8F1FF] text-[#002B7F] border border-[#B3D1FF]">
                <span className="w-2 h-2 rounded-full bg-[#002B7F]" />
                {statutLibelle}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#002B7F] tracking-tight pt-1">
              {demande.objet}
            </h1>
          </div>

          {/* Boutons d'Action Rapides */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Bouton Impression Fiche PDF */}
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-[#002B7F] hover:bg-[#001f5c] text-white text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95"
            >
              <span>Imprimer la fiche PDF</span>
            </button>

            {isPending && (
              <>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#CBD5E1] hover:border-[#002B7F] text-[#002B7F] hover:bg-[#E8F1FF] text-xs font-bold flex items-center transition-all cursor-pointer shadow-xs"
                >
                  <span>Modifier</span>
                </button>

                <button
                  onClick={() => setIsCancelModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 text-xs font-bold flex items-center transition-all cursor-pointer"
                >
                  <span>Annuler</span>
                </button>
              </>
            )}

            <div className="text-left sm:text-right text-xs text-[#1E293B] font-semibold">
              <p>Créée le {formatDate(demande.date_creation)}</p>
              {demande.date_cloture && (
                <p className="text-emerald-800 font-bold mt-0.5">
                  Clôturée le {formatDate(demande.date_cloture)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BANNIÈRE D'INFORMATION PRESTATAIRE / SAV EXTERNE */}
      {escalades.length > 0 && (
        <div className="p-5 rounded-3xl bg-[#E8F1FF] border border-[#B3D1FF] space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#002B7F]">
                Dossier délégué à un Prestataire / SAV Externe
              </span>
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-white text-[#002B7F] border border-[#B3D1FF]">
                {escalades[0].nom_prestataire}
              </span>
            </div>
            {escalades[0].reference_externe && (
              <span className="text-xs font-mono font-black text-[#002B7F] bg-white/80 px-2 py-0.5 rounded-lg">
                Dossier N° : {escalades[0].reference_externe}
              </span>
            )}
          </div>
          <p className="text-xs text-[#071530] font-semibold leading-relaxed">
            Votre matériel ou équipement fait actuellement l&apos;objet d&apos;une prise en charge spécialisée. 
            Motif : {escalades[0].motif}
          </p>
          {escalades[0].date_retour_prevue && (
            <p className="text-[11px] text-[#475569] font-bold">
              Date de restitution estimée : {formatDate(escalades[0].date_retour_prevue)}
            </p>
          )}
        </div>
      )}

      {/* 2. PROGRESSION DU TRAITEMENT (STEPPER) */}
      <div className="p-5 sm:p-6 bg-white border border-slate-100 rounded-3xl space-y-4 shadow-[0_2px_16px_rgba(0,43,127,0.03)]">
        <p className="text-xs font-black uppercase tracking-wider text-[#002B7F]">
          Progression du traitement
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
          {steps.map((step, idx) => {
            const isDone = step.completed;
            const isCurrent = step.current;

            return (
              <div
                key={step.label}
                className={`flex sm:flex-col items-center sm:items-start gap-3 p-3 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'border-[#B3D1FF] bg-[#E8F1FF] text-[#002B7F] font-black shadow-xs'
                    : isDone
                    ? 'border-emerald-100 bg-emerald-50/70 text-emerald-950 font-bold'
                    : 'border-slate-100 bg-slate-50/50 text-[#475569]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                    isCurrent
                      ? 'bg-[#002B7F] text-white animate-pulse'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isDone ? '✓' : idx + 1}
                </div>

                <div className="overflow-hidden">
                  <p className={`text-xs truncate ${isCurrent ? 'text-[#002B7F] font-black' : isDone ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {isCurrent ? 'En cours' : isDone ? 'Validé' : 'À venir'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. BLOC ENCADRÉ SPÉCIAL : RÉSOLUTION */}
      {isResolueOrCloturee && (
        <div className="space-y-4">

          {/* BANNIÈRE D'ACTION DU DEMANDEUR : VALIDATION OU RÉOUVERTURE DU TICKET */}
          {statutLibelle.toLowerCase().includes('résol') && !statutLibelle.toLowerCase().includes('clôtur') && (
            <div className="p-5 sm:p-6 bg-[#E8F1FF] border border-[#B3D1FF] rounded-3xl shadow-[0_2px_14px_rgba(0,43,127,0.04)] space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#002B7F] text-white">
                      Action requise
                    </span>
                    <h3 className="text-sm font-black text-[#002B7F]">
                      Confirmation de la résolution
                    </h3>
                  </div>
                  <p className="text-xs text-[#1E293B] font-medium">
                    Le service technique a indiqué avoir résolu cette demande. Merci de tester et de confirmer le bon fonctionnement.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                  <button
                    onClick={handleConfirmClosure}
                    disabled={isClosingDirect}
                    className="inline-flex items-center px-4 py-2.5 rounded-xl bg-[#002B7F] hover:bg-[#001f5c] text-white text-xs font-black transition-all active:scale-95 cursor-pointer shadow-xs disabled:opacity-60"
                  >
                    {isClosingDirect ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Confirmer la clôture</span>
                  </button>

                  <button
                    onClick={() => setIsReopenModalOpen(true)}
                    className="inline-flex items-center px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-rose-700 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
                  >
                    <span>Le problème persiste / Rouvrir</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Note de Résolution */}
          <div className="p-6 bg-white border border-slate-100 shadow-[0_2px_16px_rgba(0,43,127,0.03)] rounded-3xl space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black text-[#002B7F] uppercase tracking-wider">
                Dossier de Résolution
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-slate-500 font-bold uppercase text-[10px]">Intervenant (Services Généraux)</p>
                <p className="text-slate-900 font-extrabold mt-0.5">
                  {demande.technicien?.nom || 'Services Généraux'}
                </p>
              </div>

              <div>
                <p className="text-slate-500 font-bold uppercase text-[10px]">Date de résolution</p>
                <p className="text-slate-900 font-extrabold mt-0.5">
                  {demande.date_cloture ? formatDate(demande.date_cloture) : 'Récemment résolue'}
                </p>
              </div>

              <div>
                <p className="text-slate-500 font-bold uppercase text-[10px]">Statut final</p>
                <span className="inline-block text-[#002B7F] bg-[#E8F1FF] px-2.5 py-0.5 rounded-lg font-extrabold mt-0.5">
                  {statutLibelle}
                </span>
              </div>
            </div>

            {demande.note_resolution && (
              <div className="pt-2">
                <p className="text-slate-600 font-bold text-xs mb-1">Note de résolution des Services Généraux :</p>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-800 font-medium leading-relaxed">
                  « {demande.note_resolution} »
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. INFORMATIONS DE LA DEMANDE (CARTES ORGANISÉES) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Description & Contenu technique (2 colonnes) */}
        <div className="lg:col-span-2 p-6 sm:p-7 bg-white border border-slate-100 rounded-3xl space-y-6 shadow-[0_2px_16px_rgba(0,43,127,0.03)]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#002B7F]">
              Détail du problème
            </h2>
            {demande.categorie_details && (
              <span className="text-xs font-medium px-3 py-0.5 rounded-lg bg-[#E8F1FF] text-[#002B7F]">
                {demande.categorie_details.libelle}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Description transmise
            </p>
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 text-xs text-slate-900 font-medium leading-relaxed whitespace-pre-wrap">
              {demande.description}
            </div>
          </div>

          {/* Pièce jointe avec téléchargement et ouverture */}
          {demande.piece_jointe && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Pièce jointe / Capture
              </p>
              <div className="p-3.5 rounded-2xl border border-blue-100 bg-[#E8F1FF] space-y-1">
                <p className="text-xs font-bold text-[#002B7F] truncate">
                  {demande.piece_jointe.split('/').pop()}
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <a
                    href={demande.piece_jointe}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-[#002B7F] hover:underline"
                  >
                    Ouvrir l&apos;aperçu
                  </a>
                  <a
                    href={demande.piece_jointe}
                    download
                    className="text-[11px] font-bold text-[#FF5E00] hover:underline"
                  >
                    Télécharger
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contacts & Responsables (1 colonne) */}
        <div className="p-6 sm:p-7 bg-white border border-slate-100 rounded-3xl space-y-5 shadow-[0_2px_16px_rgba(0,43,127,0.03)]">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#002B7F]">
              Acteurs &amp; Contact
            </h2>
          </div>

          {/* Demandeur */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Demandeur</p>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold text-slate-900 truncate">
                {demande.demandeur.nom || demande.demandeur.email}
              </p>
              {demande.demandeur.departement && (
                <p className="text-[11px] text-slate-600 font-medium truncate">{demande.demandeur.departement}</p>
              )}
            </div>
          </div>

          {/* Services Généraux / Intervenant assigné */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Services Généraux / Intervenant</p>
            {demande.technicien ? (
              <div className="p-3 rounded-2xl bg-[#E8F1FF] border border-blue-100">
                <p className="text-xs font-bold text-[#002B7F] truncate">
                  {demande.technicien.nom || demande.technicien.email}
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-[#E8F1FF] text-xs text-[#002B7F] font-medium">
                En attente de prise en charge par les Services Généraux.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 5. HISTORIQUE & COMMENTAIRES / ÉCHANGES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* TIMELINE DE L'HISTORIQUE */}
        <div className="p-6 sm:p-7 bg-white border border-slate-100 rounded-3xl space-y-4 shadow-[0_2px_16px_rgba(0,43,127,0.03)]">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#002B7F]">
              Historique de la demande
            </h2>
          </div>

          <div className="space-y-3">
            {historique.map((item, idx) => (
              <div key={item.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <p className="text-xs font-bold text-slate-900">
                  Statut : <span className="text-[#002B7F] font-black">{item.nouveau_statut?.libelle || 'Enregistré'}</span>
                </p>
                <p className="text-xs text-[#475569] font-medium">
                  {formatDateTime(item.date_changement)}
                  {item.modifie_par && ` · par ${item.modifie_par.nom || item.modifie_par.email}`}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FIL DE DISCUSSION / COMMENTAIRES */}
        <div className="p-6 sm:p-7 bg-white border border-slate-100 rounded-3xl space-y-4 flex flex-col justify-between shadow-[0_2px_16px_rgba(0,43,127,0.03)]">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#002B7F]">
                Messages
              </h2>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {commentaires.length === 0 ? (
                <div className="p-6 text-center text-slate-600 text-xs font-medium">
                  Aucun message pour le moment. Vous pouvez poser une question ci-dessous.
                </div>
              ) : (
                commentaires.map((com) => {
                  const isTech = com.auteur_details?.role === 'technicien';

                  return (
                    <div
                      key={com.id}
                      className={`p-3.5 rounded-2xl text-xs space-y-1.5 ${
                        isTech
                          ? 'bg-[#E8F1FF] text-slate-900'
                          : 'bg-slate-50 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="text-slate-900">{com.auteur_details?.nom || `Utilisateur #${com.auteur}`}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-md text-[10px] uppercase font-bold ${
                              isTech
                                ? 'bg-[#E8F1FF] text-[#002B7F]'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isTech ? 'Technicien' : 'Demandeur'}
                          </span>
                        </div>
                        <span className="text-slate-600 text-[10px] font-medium">
                          {formatDateTime(com.date_creation)}
                        </span>
                      </div>
                      <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                        {com.contenu}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Formulaire d'envoi de commentaire */}
          <form onSubmit={handleSendComment} className="pt-3 border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              placeholder="Écrire un message pour le support technique..."
              value={nouveauCommentaire}
              onChange={(e) => setNouveauCommentaire(e.target.value)}
              disabled={sendingComment}
              className="flex-1 bg-slate-50 hover:bg-slate-100/70 border border-slate-100 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#B3D1FF] transition-all font-medium"
            />
            <button
              type="submit"
              disabled={!nouveauCommentaire.trim() || sendingComment}
              className="bg-[#002B7F] hover:bg-[#001F5C] text-white px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 cursor-pointer disabled:opacity-50 transition-all active:scale-95 shadow-xs"
            >
              {sendingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Envoyer</span>}
            </button>
          </form>
        </div>

      </div>

      {/* MODAL D'ANNULATION */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] max-w-md w-full p-6 space-y-4 shadow-sm">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#0a1e42]">Annuler cette demande ?</h3>
              <p className="text-xs text-[#475569] font-medium">
                Cette action fermera définitivement le ticket #{demande.id}. Le support technique ne prendra plus en charge cette demande.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#475569] uppercase">
                Motif de l&apos;annulation (facultatif)
              </label>
              <textarea
                rows={2}
                value={cancelMotif}
                onChange={(e) => setCancelMotif(e.target.value)}
                placeholder="Ex: Problème résolu par moi-même, fausse manipulation..."
                className="w-full p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs text-[#0a1e42] focus:bg-white focus:outline-none focus:border-[#0b3b8f]"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#0a1e42] bg-[#f8fafc] border border-[#e2e8f0] hover:border-[#0b3b8f]"
              >
                Garder la demande
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold flex items-center gap-1.5"
              >
                {isCancelling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirmer l&apos;annulation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE MODIFICATION */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-fade-in">
          <form onSubmit={handleConfirmEdit} className="bg-white rounded-2xl border border-[#e2e8f0] max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <h3 className="text-base font-bold text-[#0a1e42]">Modifier ma demande</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-[#475569] hover:text-[#0a1e42] hover:bg-[#f8fafc]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#0a1e42]">Objet de la demande</label>
                <input
                  type="text"
                  value={editObjet}
                  onChange={(e) => setEditObjet(e.target.value)}
                  required
                  className="w-full p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs text-[#0a1e42] font-medium focus:bg-white focus:outline-none focus:border-[#0b3b8f]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#0a1e42]">Niveau d&apos;urgence</label>
                <select
                  value={editUrgence}
                  onChange={(e) => setEditUrgence(e.target.value as UrgenceLevel)}
                  className="w-full p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs font-bold text-[#0a1e42] focus:bg-white focus:outline-none"
                >
                  <option value="faible">Faible (Pas de blocage)</option>
                  <option value="moyen">Moyenne (Gênant pour le travail)</option>
                  <option value="eleve">Élevée (Arrêt complet de l&apos;activité)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#0a1e42]">Description détaillée</label>
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  required
                  className="w-full p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs text-[#0a1e42] font-medium focus:bg-white focus:outline-none focus:border-[#0b3b8f]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#0a1e42]">Remplacer la pièce jointe (optionnel)</label>
                <input
                  type="file"
                  onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-[#475569] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#eef4ff] file:text-[#0b3b8f] hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#0a1e42] bg-[#f8fafc] border border-[#e2e8f0] hover:border-[#0b3b8f]"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="px-5 py-2 rounded-xl bg-[#FF5E00] hover:bg-[#E05200] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Enregistrer les modifications</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL DE RÉOUVERTURE DU TICKET */}
      {isReopenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleConfirmReopen}
            className="w-full max-w-lg bg-white rounded-3xl border border-slate-100 shadow-[0_10px_40px_rgba(0,43,127,0.1)] p-6 sm:p-7 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-[#071530]">
                  Rouvrir le ticket {demande.reference || `#DEM-${demande.id}`}
                </h3>
                <p className="text-[11px] text-[#475569]">
                  Le ticket repassera en cours auprès de l&apos;équipe technique.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReopenModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#071530] uppercase tracking-wider">
                Motif de la réouverture *
              </label>
              <textarea
                rows={4}
                required
                value={reopenMotif}
                onChange={(e) => setReopenMotif(e.target.value)}
                placeholder="Expliquez ce qui ne fonctionne toujours pas ou pourquoi le problème persiste..."
                className="w-full p-3.5 bg-[#F4F7FB] border border-slate-100 rounded-2xl text-xs sm:text-sm text-[#071530] placeholder-[#64748b] focus:bg-white focus:outline-none focus:border-[#B3D1FF] transition-all font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsReopenModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#475569] bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isReopening || !reopenMotif.trim()}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-60"
              >
                {isReopening && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirmer la réouverture</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
