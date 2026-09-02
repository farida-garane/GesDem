'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { useAuth } from '@/context/AuthContext';
import { demandeService } from '@/services/demande.service';
import { Demande, Statut, HistoriqueStatut, Commentaire } from '@/types/demande';
import {
  ArrowLeft,
  Calendar,
  User,
  Phone,
  Building2,
  Paperclip,
  Clock,
  CheckCircle2,
  Send,
  Loader2,
  AlertCircle,
  FileText,
  UserCheck,
  History,
  MessageSquare,
  Wrench,
  Check,
  Star,
  ExternalLink,
  Download,
  Info,
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

      const [demandeData, statutsData, historiqueData, commentairesData] = await Promise.all([
        demandeService.getDemandeById(demandeId),
        demandeService.getStatuts(),
        demandeService.getDemandeHistorique(demandeId),
        demandeService.getCommentaires(demandeId),
      ]);

      setDemande(demandeData);
      setStatuts(statutsData);
      setHistorique(historiqueData);
      setCommentaires(commentairesData);

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
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Impossible de charger l&apos;intervention</h2>
          <p className="text-xs text-slate-500 mt-1">{error || 'Demande introuvable.'}</p>
        </div>
        <Link
          href="/interventions"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-black transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
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
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : (
              <Info className="w-4 h-4 text-blue-400" />
            )}
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
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors group"
        >
          <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:border-blue-300 shadow-2xs">
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <span>Retour aux interventions</span>
        </Link>

        {/* Titre & Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-sm font-extrabold text-blue-700 bg-blue-50/90 px-3 py-0.5 rounded-lg border border-blue-200/60">
                {demande.reference || `DEM-${String(demande.id).padStart(4, '0')}`}
              </span>
              <PriorityBadge urgence={demande.urgence} />
              <span
                className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-lg text-xs font-bold border shadow-2xs"
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
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight pt-1">
              {demande.objet}
            </h1>
          </div>

          <div className="text-right text-xs text-slate-500 font-medium hidden sm:block">
            <p>Créée le {formatDate(demande.date_creation)}</p>
            {demande.date_cloture && (
              <p className="text-emerald-700 font-bold mt-0.5">
                Clôturée le {formatDate(demande.date_cloture)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* BLOC ÉVALUATION DU DEMANDEUR (Si déjà notée) */}
      {demande.note_satisfaction && (
        <div className="p-5 bg-gradient-to-r from-amber-500/10 via-amber-50 to-white border border-amber-200/90 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h3 className="text-sm font-extrabold text-slate-900">
                Avis du Collaborateur : {demande.note_satisfaction}/5 étoiles
              </h3>
            </div>
            {demande.avis_satisfaction && (
              <p className="text-xs text-slate-700 italic font-medium">
                « {demande.avis_satisfaction} »
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= demande.note_satisfaction!
                    ? 'text-amber-500 fill-amber-500'
                    : 'text-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Grille 2 Colonnes : Haut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* BLOC 1 : Dossier technique & Demandeur (2 colonnes) */}
        <div className="lg:col-span-2 p-6 sm:p-7 bg-white border border-slate-200/90 rounded-3xl space-y-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600 stroke-[2.2]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Dossier &amp; Détail de la demande
              </h2>
            </div>
            {demande.categorie_details && (
              <span className="text-xs font-bold px-3 py-0.5 rounded-lg bg-slate-100/90 text-slate-800 border border-slate-200">
                {demande.categorie_details.libelle}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Description formulée par le demandeur
            </p>
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-xs text-slate-900 leading-relaxed whitespace-pre-wrap font-medium">
              {demande.description}
            </div>
          </div>

          {/* Pièce jointe */}
          {demande.piece_jointe && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Pièce jointe fournie
              </p>
              <div className="inline-flex items-center gap-4 p-3.5 rounded-2xl border border-blue-200 bg-blue-50/40 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Paperclip className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-extrabold text-slate-900 truncate max-w-xs">
                    {demande.piece_jointe.split('/').pop()}
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <a
                      href={demande.piece_jointe}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Ouvrir l&apos;aperçu</span>
                    </a>
                    <a
                      href={demande.piece_jointe}
                      download
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-800 hover:underline"
                    >
                      <Download className="w-3 h-3" />
                      <span>Télécharger</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Informations demandeur */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                <User className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="truncate">
                <p className="text-[10px] uppercase font-bold text-slate-500">Demandeur</p>
                <p className="text-xs font-extrabold text-slate-900 truncate">
                  {demande.demandeur.nom || demande.demandeur.email}
                </p>
              </div>
            </div>

            {demande.demandeur.departement && (
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                  <Building2 className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="truncate">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Département</p>
                  <p className="text-xs font-extrabold text-slate-900 truncate">{demande.demandeur.departement}</p>
                </div>
              </div>
            )}

            {demande.demandeur.telephone && (
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                  <Phone className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="truncate">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Contact</p>
                  <p className="text-xs font-extrabold text-slate-900 truncate">{demande.demandeur.telephone}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BLOC 2 : Contrôle Intervention (Intervenant & Statuts) (1 colonne) */}
        <div className="p-6 sm:p-7 bg-white border border-slate-200/90 rounded-3xl space-y-6 flex flex-col justify-between shadow-xs">
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Wrench className="w-4 h-4 text-blue-600 stroke-[2.2]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Gestion &amp; Traitement du Dossier
              </h2>
            </div>

            {/* Intervenant assigné */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Responsable du traitement
              </p>
              {demande.technicien ? (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                    {(demande.technicien.nom || demande.technicien.email || 'I').charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-black text-slate-900 truncate">
                      {demande.technicien.nom || demande.technicien.email}
                    </p>
                    <p className="text-[10px] font-bold text-orange-600">Intervenant en charge</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>En attente de prise en charge par un intervenant.</span>
                  </div>
                  <button
                    onClick={handleAssignToMe}
                    disabled={assigningSelf}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-black py-2.5 shadow-xs hover:shadow-md active:scale-98 transition-all cursor-pointer"
                  >
                    {assigningSelf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                    <span>Prendre en charge ce dossier</span>
                  </button>
                </div>
              )}
            </div>

            {/* Changement de statut de la demande par l'intervenant */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
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
                          ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-300 text-slate-800'
                      }`}
                    >
                      <span className="truncate">{s.libelle}</span>
                      {isActive && <Check className="w-3.5 h-3.5 shrink-0 ml-1 text-white stroke-[2.5]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action rapide : Finaliser / Clôturer avec note */}
          {!isTermine && (
            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsResolutionModalOpen(true)}
                disabled={updatingStatut}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold py-2.5 shadow-sm shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Valider le traitement / Résoudre</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Grille 2 Colonnes : Bas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* BLOC 3 : Timeline & Historique des étapes */}
        <div className="p-6 sm:p-7 bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <History className="w-4 h-4 text-blue-600 stroke-[2.2]" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Timeline &amp; Historique des étapes
            </h2>
          </div>

          {historique.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-medium">
              Aucun changement de statut enregistré pour le moment.
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-100">
              {historique.map((item, idx) => (
                <div key={item.id || idx} className="relative group">
                  <span className="absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white bg-blue-600 shadow-xs" />
                  
                  <div className="space-y-1">
                    <p className="text-xs font-extrabold text-slate-900">
                      Statut passé à :{' '}
                      <span className="text-blue-700">
                        {item.nouveau_statut?.libelle || 'Inconnu'}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(item.date_changement)}</span>
                      {item.modifie_par && (
                        <span>• par <strong className="text-slate-700">{item.modifie_par.nom || item.modifie_par.email}</strong></span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BLOC 4 : Journal d'échange & Commentaires */}
        <div className="p-6 sm:p-7 bg-white border border-slate-200/90 rounded-3xl space-y-4 flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600 stroke-[2.2]" />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Journal de suivi &amp; Échanges
                </h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                {commentaires.length} message{commentaires.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Fil des messages */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {commentaires.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs font-medium">
                  Aucun message ou compte-rendu pour le moment.
                </div>
              ) : (
                commentaires.map((com) => {
                  const isAuthorTech = com.auteur_details?.role === 'technicien';
                  return (
                    <div
                      key={com.id}
                      className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                        isAuthorTech
                          ? 'bg-blue-50/60 border-blue-200/70 text-slate-900'
                          : 'bg-slate-50/80 border-slate-200/80 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="text-slate-900">{com.auteur_details?.nom || `Utilisateur #${com.auteur}`}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-md text-[10px] uppercase font-extrabold ${
                              isAuthorTech
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {isAuthorTech ? 'Intervenant' : 'Demandeur'}
                          </span>
                        </div>
                        <span className="text-slate-500 text-[10px] font-medium">
                          {formatDate(com.date_creation)}
                        </span>
                      </div>
                      <p className="text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">
                        {com.contenu}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Formulaire d'envoi de message */}
          <form onSubmit={handleSendComment} className="pt-3 border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              placeholder="Écrire un compte-rendu ou une réponse pour le demandeur..."
              value={nouveauCommentaire}
              onChange={(e) => setNouveauCommentaire(e.target.value)}
              disabled={sendingComment}
              className="flex-1 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
            <button
              type="submit"
              disabled={!nouveauCommentaire.trim() || sendingComment}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow-xs disabled:opacity-50 transition-all active:scale-95"
            >
              {sendingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </form>
        </div>

      </div>

      {/* ========================================================
          MODALE DE DÉCISION & RÉSOLUTION DU DOSSIER
          ======================================================== */}
      {isResolutionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <form onSubmit={handleConfirmResolution} className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Validation du traitement du dossier
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsResolutionModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Veuillez renseigner la décision, les actions réalisées ou la réponse finale apportée au demandeur (ex: commande effectuée, document transmis, intervention d&apos;un prestataire externe).
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase">
                Compte-rendu de décision / Note de résolution
              </label>
              <textarea
                rows={4}
                value={noteResolution}
                onChange={(e) => setNoteResolution(e.target.value)}
                placeholder="Ex: Demande validée par la Direction. Le matériel a été commandé auprès de notre fournisseur avec livraison prévue vendredi matin..."
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsResolutionModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmittingResolution}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                {isSubmittingResolution && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Valider et clôturer le dossier</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
