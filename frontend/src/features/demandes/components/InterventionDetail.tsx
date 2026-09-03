'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { SlaBadge } from '@/components/ui/SlaBadge';
import { useAuth } from '@/context/AuthContext';
import { demandeService } from '@/services/demande.service';
import { escaladeService } from '@/services/escalade.service';
import { Demande, Statut, HistoriqueStatut, Commentaire } from '@/types/demande';
import { EscaladeExterne } from '@/types/escalade';
import { EscaladeExterneModal } from '@/features/interventions/components/EscaladeExterneModal';
import { JournalExterneSection } from '@/features/interventions/components/JournalExterneSection';
import {
  Loader2,
  X
} from 'lucide-react';

interface InterventionDetailProps {
  demandeId: string | number;
}

export function InterventionDetail({ demandeId }: InterventionDetailProps) {
  const { user } = useAuth();

  const [demande, setDemande] = useState<Demande | null>(null);
  const [statuts, setStatuts] = useState<Statut[]>([]);
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

  // Status update state
  const [updatingStatut, setUpdatingStatut] = useState(false);
  const [assigningSelf, setAssigningSelf] = useState(false);

  // Modale d'Escalade vers Prestataire Externe
  const [isEscaladeModalOpen, setIsEscaladeModalOpen] = useState(false);

  // Modale de Résolution & Décision
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
  const [noteResolution, setNoteResolution] = useState('');
  const [isSubmittingResolution, setIsSubmittingResolution] = useState(false);

  // New Comment state
  const [nouveauCommentaire, setNouveauCommentaire] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  // Load all details
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [demandeData, statutsData, historiqueData, commentairesData, escaladesData] = await Promise.all([
        demandeService.getDemandeById(demandeId),
        demandeService.getStatuts(),
        demandeService.getDemandeHistorique(demandeId),
        demandeService.getCommentaires(demandeId),
        escaladeService.getEscalades(demandeId),
      ]);

      setDemande(demandeData);
      setStatuts(statutsData);
      setHistorique(historiqueData);
      setCommentaires(commentairesData);
      setEscalades(escaladesData);

      if (demandeData?.note_resolution) {
        setNoteResolution(demandeData.note_resolution);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [demandeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle status change
  const handleStatutChange = async (nouveauStatutId: number) => {
    if (!demande || demande.statut === nouveauStatutId) return;
    setUpdatingStatut(true);
    try {
      await demandeService.updateDemandeStatut(demande.id, { statut: nouveauStatutId });
      showToast('Statut de la demande mis à jour avec succès !', 'success');
      await loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Erreur lors du changement de statut', 'error');
    } finally {
      setUpdatingStatut(false);
    }
  };

  // Handle self-assignment
  const handleAssignToMe = async () => {
    if (!demande || !user) return;
    setAssigningSelf(true);
    try {
      const statutEnCours = statuts.find((s) => s.libelle.toLowerCase().includes('cours') || s.ordre === 2);
      await demandeService.updateDemandeStatut(demande.id, {
        technicien: user.id,
        ...(statutEnCours ? { statut: statutEnCours.id } : {}),
      });
      showToast('Vous avez pris en charge ce dossier.', 'success');
      await loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Erreur lors de la prise en charge", 'error');
    } finally {
      setAssigningSelf(false);
    }
  };

  // Confirmer la résolution avec note de décision
  const handleConfirmResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demande) return;

    setIsSubmittingResolution(true);
    try {
      const statutTermine = statuts.find(
        (s) => s.libelle.toLowerCase().includes('resolu') || s.libelle.toLowerCase().includes('cloture') || s.ordre === 4
      );

      await demandeService.updateDemandeStatut(demande.id, {
        statut: statutTermine ? statutTermine.id : 4,
      });

      if (noteResolution.trim()) {
        await demandeService.updateDemande(demande.id, {
          description: demande.description, // preserve
        });
      }

      setIsResolutionModalOpen(false);
      showToast('Dossier validé et marqué comme résolu !', 'success');
      await loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Erreur lors de la validation', 'error');
    } finally {
      setIsSubmittingResolution(false);
    }
  };

  // Handle send comment
  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouveauCommentaire.trim() || !demande) return;

    setSendingComment(true);
    try {
      await demandeService.createCommentaire(demande.id, nouveauCommentaire.trim());
      setNouveauCommentaire('');
      const updatedComments = await demandeService.getCommentaires(demande.id);
      setCommentaires(updatedComments);
      showToast('Message publié dans le journal.', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Erreur lors de l'envoi du message", 'error');
    } finally {
      setSendingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
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
        <p className="text-xs font-semibold">Chargement du dossier d&apos;intervention...</p>
      </div>
    );
  }

  if (error || !demande) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Impossible de charger l&apos;intervention</h2>
          <p className="text-xs text-slate-500 mt-1">{error || 'Demande introuvable.'}</p>
        </div>
        <Link
          href="/interventions"
          className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-black transition-colors"
        >
          <span>Retour à la liste</span>
        </Link>
      </div>
    );
  }

  const statutCouleur = demande.statut_details?.couleur || '#64748b';
  const statutLibelle = demande.statut_details?.libelle || 'En attente';
  const isTermine = statutLibelle.toLowerCase().includes('resolu') || statutLibelle.toLowerCase().includes('cloture') || demande.statut === 4 || demande.statut === 5;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-16 relative">
      
      {/* TOAST FLOTTANT */}
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

      {/* En-tête de navigation */}
      <div className="space-y-3">
        <Link
          href="/interventions"
          className="inline-flex items-center text-xs font-bold text-[#002B7F] hover:text-[#0047cc] transition-colors group"
        >
          <span>&larr; Retour aux interventions</span>
        </Link>

      {/* Titre & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-sm font-black text-[#002B7F] bg-[#E8F1FF] px-3 py-0.5 rounded-lg border border-[#B3D1FF]">
              {demande.reference || `DEM-${String(demande.id).padStart(4, '0')}`}
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

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-[#002B7F] hover:bg-[#001f5c] text-white text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95"
          >
            <span>Imprimer la fiche PDF</span>
          </button>

          <div className="text-right text-xs text-[#1E293B] font-semibold hidden sm:block">
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

      {/* GRILLE PRINCIPALE DE L'INTERVENTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* BLOC 1 : Détails de la demande & Demandeur (2 colonnes) */}
        <div className="lg:col-span-2 p-6 sm:p-7 bg-white border border-[#CBD5E1] rounded-2xl space-y-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#002B7F]">
              Dossier de Demande Initiale
            </h2>
            {demande.categorie_details && (
              <span className="text-xs font-bold px-3 py-0.5 rounded-lg bg-[#E8F1FF] text-[#002B7F] border border-[#B3D1FF]">
                {demande.categorie_details.libelle}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <p className="text-[11px] font-black text-[#002B7F] uppercase tracking-wider">
              Description formulée par le demandeur
            </p>
            <div className="p-4 rounded-xl bg-white border border-[#CBD5E1] text-xs text-[#071530] leading-relaxed whitespace-pre-wrap font-semibold">
              {demande.description}
            </div>
          </div>

          {/* Demandeur */}
          <div className="pt-2 border-t border-[#E2E8F0]">
            <p className="text-[11px] font-black text-[#002B7F] uppercase tracking-wider mb-2">Demandeur</p>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#CBD5E1]">
              <div className="w-8 h-8 rounded-lg bg-[#E8F1FF] text-[#002B7F] flex items-center justify-center text-xs font-bold shrink-0">
                {(demande.demandeur?.nom || demande.demandeur?.email || 'D').charAt(0).toUpperCase()}
              </div>
              <div className="text-xs">
                <p className="font-bold text-[#071530]">{demande.demandeur?.nom || demande.demandeur?.email}</p>
                <p className="text-[#1E293B] font-semibold">{demande.demandeur?.departement || 'Non renseigné'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* BLOC 2 : Actions & Prise en charge */}
        <div className="p-6 sm:p-7 bg-white border border-[#CBD5E1] rounded-2xl space-y-6 shadow-xs">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-[#002B7F] pb-3 border-b border-[#E2E8F0]">
              Intervenant &amp; Traitement
            </h2>

            {/* Intervenant assigné */}
            <div className="py-3">
              {demande.technicien ? (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#E8F1FF] border border-[#B3D1FF]">
                  <div className="w-9 h-9 rounded-lg bg-[#002B7F] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    {(demande.technicien.nom || demande.technicien.email || 'I').charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-[#071530] truncate">
                      {demande.technicien.nom || demande.technicien.email}
                    </p>
                    <p className="text-[10px] font-bold text-[#002B7F]">Intervenant en charge</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-[#E8F1FF] border border-[#B3D1FF] text-xs text-[#002B7F] font-bold">
                    <span>En attente de prise en charge par un intervenant.</span>
                  </div>
                  {/* Action principale : Orange de l'affiche (#FF5E00) */}
                  <button
                    onClick={handleAssignToMe}
                    disabled={assigningSelf}
                    className="w-full flex items-center justify-center bg-[#FF5E00] hover:bg-[#E05200] text-white rounded-xl text-xs font-black py-3 active:scale-95 transition-all cursor-pointer shadow-md"
                  >
                    {assigningSelf && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                    <span>Prendre en charge ce dossier</span>
                  </button>
                </div>
              )}
            </div>

            {/* Changement de statut de la demande par l'intervenant */}
            <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
              <p className="text-[11px] font-black uppercase tracking-wider text-[#002B7F]">
                Mettre à jour l&apos;état de la demande
              </p>
              <div className="grid grid-cols-2 gap-2">
                {statuts.map((s) => {
                  const isActive = demande.statut === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={updatingStatut || isActive}
                      onClick={() => handleStatutChange(s.id)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isActive
                          ? 'border-[#B3D1FF] bg-[#E8F1FF] text-[#002B7F]'
                          : 'border-[#CBD5E1] bg-white hover:bg-[#F0F6FF] hover:border-[#002B7F] text-[#071530]'
                      }`}
                    >
                      <span className="truncate">{s.libelle}</span>
                      {isActive && <span className="text-[#002B7F] font-bold ml-1">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        {/* Action rapide : Finaliser / Clôturer avec note */}
        {!isTermine && (
          <div className="pt-4 border-t border-[#e2e8f0] space-y-2">
            <button
              type="button"
              onClick={() => setIsEscaladeModalOpen(true)}
              className="w-full bg-[#002B7F] hover:bg-[#001f5c] text-white rounded-xl text-xs font-bold py-2.5 flex items-center justify-center active:scale-98 transition-all cursor-pointer shadow-sm"
            >
              <span>Déléguer / SAV Prestataire Externe</span>
            </button>

            <button
              type="button"
              onClick={() => setIsResolutionModalOpen(true)}
              disabled={updatingStatut}
              className="w-full bg-[#f26522] hover:bg-[#d94f0f] text-white rounded-xl text-xs font-bold py-2.5 flex items-center justify-center active:scale-98 transition-all cursor-pointer shadow-xs"
            >
              <span>Valider le traitement / Résoudre</span>
            </button>
          </div>
        )}
      </div>

    </div>

    {/* BLOC PRESTATAIRE EXTERNE & JOURNAL DES TRANSACTIONS */}
    <JournalExterneSection
      escalades={escalades}
      onRefresh={loadData}
      canEdit={!isTermine}
    />

    {/* Grille 2 Colonnes : Bas */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* BLOC 3 : Timeline & Historique des étapes */}
      <div className="p-6 sm:p-7 bg-white border border-[#e2e8f0] rounded-2xl space-y-4 shadow-sm">
        <div className="pb-3 border-b border-[#E2E8F0]">
          <h2 className="text-xs font-black uppercase tracking-wider text-[#002B7F]">
            Timeline &amp; Historique des étapes
          </h2>
        </div>

        {historique.length === 0 ? (
          <div className="p-8 text-center text-[#1E293B] text-xs font-medium">
            Aucun changement de statut enregistré pour le moment.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#B3D1FF]">
            {historique.map((item, idx) => (
              <div key={item.id || idx} className="relative group">
                <span className="absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white bg-[#002B7F]" />
                
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#071530]">
                    Statut passé à :{' '}
                    <span className="text-[#002B7F] font-black">
                      {item.nouveau_statut?.libelle || 'Inconnu'}
                    </span>
                  </p>
                  <p className="text-[11px] text-[#1E293B] font-semibold">
                    <span>{formatDate(item.date_changement)}</span>
                    {item.modifie_par && (
                      <span> • par <strong className="text-[#071530]">{item.modifie_par.nom || item.modifie_par.email}</strong></span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BLOC 4 : Journal d'échange & Commentaires */}
      <div className="p-6 sm:p-7 bg-white border border-[#CBD5E1] rounded-2xl space-y-4 flex flex-col justify-between shadow-xs">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#002B7F]">
              Journal de suivi &amp; Échanges
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E8F1FF] text-[#002B7F] border border-[#B3D1FF]">
              {commentaires.length} message{commentaires.length > 1 ? 's' : ''}
            </span>
          </div>

          {/* Fil des messages */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {commentaires.length === 0 ? (
              <div className="p-6 text-center text-[#1E293B] text-xs font-medium">
                Aucun message ou compte-rendu pour le moment.
              </div>
            ) : (
              commentaires.map((com) => {
                const isAuthorTech = com.auteur_details?.role === 'technicien';
                return (
                  <div
                    key={com.id}
                    className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                      isAuthorTech
                        ? 'bg-[#E8F1FF] border-[#B3D1FF] text-[#071530]'
                        : 'bg-white border-[#CBD5E1] text-[#071530]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="text-[#071530]">{com.auteur_details?.nom || `Utilisateur #${com.auteur}`}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-md text-[10px] uppercase font-bold ${
                            isAuthorTech
                              ? 'bg-[#E8F1FF] text-[#002B7F] border border-[#B3D1FF]'
                              : 'bg-[#F0F6FF] text-[#002B7F] border border-[#B3D1FF]'
                          }`}
                        >
                          {isAuthorTech ? 'Intervenant' : 'Demandeur'}
                        </span>
                      </div>
                      <span className="text-[#1E293B] text-[10px] font-semibold">
                        {formatDate(com.date_creation)}
                      </span>
                    </div>
                    <p className="text-[#071530] font-medium leading-relaxed whitespace-pre-wrap">
                      {com.contenu}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Formulaire d'envoi de message */}
        <form onSubmit={handleSendComment} className="pt-3 border-t border-[#E2E8F0] flex items-center gap-2">
          <input
            type="text"
            placeholder="Écrire un compte-rendu ou une réponse pour le demandeur..."
            value={nouveauCommentaire}
            onChange={(e) => setNouveauCommentaire(e.target.value)}
            disabled={sendingComment}
            className="flex-1 bg-white hover:bg-[#F0F6FF] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#071530] placeholder-[#64748b] focus:outline-none focus:bg-white focus:border-[#002B7F] transition-all font-semibold"
          />
          <button
            type="submit"
            disabled={!nouveauCommentaire.trim() || sendingComment}
            className="bg-[#002B7F] hover:bg-[#001F5C] text-white px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer disabled:opacity-50 transition-all active:scale-95 shadow-xs"
          >
            {sendingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Envoyer</span>}
          </button>
        </form>
      </div>

    </div>

    {/* MODALE DE DÉCISION & RÉSOLUTION */}
    {isResolutionModalOpen && (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-fade-in">
        <form onSubmit={handleConfirmResolution} className="bg-white rounded-2xl border border-[#CBD5E1] max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <h3 className="text-base font-black text-[#002B7F]">
              Validation du traitement du dossier
            </h3>
            <button
              type="button"
              onClick={() => setIsResolutionModalOpen(false)}
              className="p-1 rounded-lg text-[#1E293B] hover:text-[#071530] hover:bg-[#F0F6FF]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-[#1E293B] font-semibold">
            Veuillez renseigner la décision, les actions réalisées ou la réponse finale apportée au demandeur.
          </p>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-[#002B7F] uppercase">
              Compte-rendu de décision / Note de résolution
            </label>
            <textarea
              rows={4}
              value={noteResolution}
              onChange={(e) => setNoteResolution(e.target.value)}
              placeholder="Ex: Demande validée par la Direction. Le matériel a été commandé auprès de notre fournisseur..."
              required
              className="w-full p-3 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#071530] font-medium focus:bg-white focus:outline-none focus:border-[#002B7F]"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => setIsResolutionModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#002B7F] bg-white border border-[#CBD5E1] hover:bg-[#E8F1FF]"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmittingResolution}
              className="px-6 py-2.5 rounded-xl bg-[#FF5E00] hover:bg-[#E05200] text-white text-xs font-black flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-md"
            >
              {isSubmittingResolution && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Valider et clôturer le dossier</span>
            </button>
          </div>
        </form>
      </div>
    )}

    {/* MODALE D'ESCALADE VERS PRESTATAIRE EXTERNE */}
    {demande && (
      <EscaladeExterneModal
        isOpen={isEscaladeModalOpen}
        onClose={() => setIsEscaladeModalOpen(false)}
        demandeId={demande.id}
        demandeRef={demande.reference || `DEM-${demande.id}`}
        onSuccess={loadData}
      />
    )}

    </div>
  );
}
